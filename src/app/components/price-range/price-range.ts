import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-price-range',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './price-range.html',
  styleUrls: ['./price-range.scss']
})
export class PriceRangeComponent implements OnInit {

  @Input() min: number = 0;
  @Input() max: number = 500;
  @Input() step: number = 1;
  @Input() lowValue?: number;
  @Input() highValue?: number;

  @Output() rangeChange = new EventEmitter<{ min: number; max: number }>();

  low!: number;
  high!: number;

  ngOnInit(): void {
    this.low = this.lowValue ?? this.min;
    this.high = this.highValue ?? this.max;
    this.normalize();
  }

  onLowInput(v: string | number) {
    this.low = Number(v);
    if (this.low > this.high) this.low = this.high;
    this.emitChange();
  }

  onHighInput(v: string | number) {
    this.high = Number(v);
    if (this.high < this.low) this.high = this.low;
    this.emitChange();
  }

  private normalize() {
    if (this.low < this.min) this.low = this.min;
    if (this.high > this.max) this.high = this.max;
    if (this.low > this.high) this.low = this.high;
  }

  private emitChange() {
    this.rangeChange.emit({ min: this.low, max: this.high });
  }
}
