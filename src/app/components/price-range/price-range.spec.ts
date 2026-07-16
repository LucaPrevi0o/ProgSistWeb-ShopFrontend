import { PriceRangeComponent } from './price-range';

describe('PriceRangeComponent', () => {
  it('normalizes reversed and out-of-range inputs', () => {
    const component = new PriceRangeComponent();
    component.min = 100;
    component.max = 0;
    component.lowValue = -10;
    component.highValue = 200;

    component.ngOnInit();

    expect(component.min).toBe(0);
    expect(component.max).toBe(100);
    expect(component.low).toBe(0);
    expect(component.high).toBe(100);
  });

  it('keeps the selected range ordered and emits its value', () => {
    const component = new PriceRangeComponent();
    component.min = 0;
    component.max = 100;
    component.ngOnInit();
    const emitted: Array<{ min: number; max: number }> = [];
    component.rangeChange.subscribe(value => emitted.push(value));

    component.onLowInput(90);
    component.onHighInput(20);

    expect(emitted.at(-1)).toEqual({ min: 20, max: 90 });
    expect(component.lowPercent).toBe(20);
    expect(component.highPercent).toBe(90);
  });
});
