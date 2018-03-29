import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[mathJax]'
})
export class MathJaxDirective {
  @Input('mathJax')
  expression: string;

  constructor(private element: ElementRef) { }

  ngOnChanges() {
    this.element.nativeElement.innerHTML = this.expression;
    MathJax.Hub.Queue(["Typeset", MathJax.Hub, this.element.nativeElement]);
  }
}
