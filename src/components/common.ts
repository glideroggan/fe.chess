export abstract class Common extends HTMLElement {
    root: ShadowRoot
    parser: DOMParser
    constructor() {
        super()
        this.root = this.attachShadow({ mode: 'closed' })
        this.parser = new DOMParser()
    }
    abstract importHtml(): Promise<typeof import('*.html')>
    abstract afterConnected(): void
    async connectedCallback() {
        const html = await this.importHtml()
        const doc = this.parser.parseFromString(html.default, 'text/html');
        const template: HTMLTemplateElement = doc.querySelector('template')
        this.root.appendChild(template.content.cloneNode(true));

        this.afterConnected()
    }
}

