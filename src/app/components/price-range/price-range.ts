import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-price-range',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './price-range.html',
  styleUrls: ['./price-range.scss']
})
export class PriceRangeComponent implements OnInit, OnChanges {

  @Input() min: number = 0;
  @Input() max: number = 500;
  @Input() step: number = 1;
  @Input() lowValue?: number | string;
  @Input() highValue?: number | string;

  @Output() rangeChange = new EventEmitter<{ min: number; max: number }>();

  low!: number;
  high!: number;

  ngOnInit(): void {
    this.syncFromInputs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['min'] || changes['max'] || changes['step'] || changes['lowValue'] || changes['highValue']) {
      this.syncFromInputs();
    }
  }

  onLowInput(value: string | number): void {
    this.low = this.toNumber(value, this.min);
    this.normalize();
    this.emitChange();
  }

  onHighInput(value: string | number): void {
    this.high = this.toNumber(value, this.max);
    this.normalize();
    this.emitChange();
  }

  get lowPercent(): number {
    return this.toPercent(this.low);
  }

  get highPercent(): number {
    return this.toPercent(this.high);
  }

  private syncFromInputs(): void {
    this.low = this.toNumber(this.lowValue, this.min);
    this.high = this.toNumber(this.highValue, this.max);
    this.normalize();
  }

  private normalize(): void {
    this.min = this.toNumber(this.min, 0);
    this.max = this.toNumber(this.max, this.min);
    this.step = Math.max(this.toNumber(this.step, 1), 1);

    if (this.max < this.min) {
      [this.min, this.max] = [this.max, this.min];
    }

    this.low = this.clamp(this.low, this.min, this.max);
    this.high = this.clamp(this.high, this.min, this.max);

    if (this.low > this.high) {
      [this.low, this.high] = [this.high, this.low];
    }
  }

  private toPercent(value: number): number {
    if (this.max === this.min) return 0;
    return ((value - this.min) / (this.max - this.min)) * 100;
  }

  private toNumber(value: number | string | undefined, fallback: number): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  private emitChange(): void {
    this.rangeChange.emit({ min: this.low, max: this.high });
  }
}
