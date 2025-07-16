import { Directive, HostListener, Input, Renderer2, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Directive({
    selector: '[appSsrLink]',
    standalone: true
})
export class SsrLinkDirective implements OnInit {
    @Input('appSsrLink') linkParams: any[] | string = '';
    private fullUrl: string = '';

    constructor(
        private router: Router,
        private el: ElementRef,
        private renderer: Renderer2
    ) { }

    ngOnInit() {
        this.updateHref();
    }

    private updateHref() {
        let path = '';

        if (Array.isArray(this.linkParams)) {
            path = '/' + this.linkParams.filter(Boolean).join('/');
        } else if (typeof this.linkParams === 'string') {
            path = this.linkParams.startsWith('/') ? this.linkParams : '/' + this.linkParams;
        }

        this.fullUrl = `https://tsk.in.ua${path}`;
        this.renderer.setAttribute(this.el.nativeElement, 'href', this.fullUrl);
    }

    @HostListener('click', ['$event'])
    onClick(event: MouseEvent) {
        event.preventDefault();

        if (Array.isArray(this.linkParams)) {
            this.router.navigate(this.linkParams);
        } else if (typeof this.linkParams === 'string') {
            this.router.navigate([this.linkParams]);
        }
    }
}
