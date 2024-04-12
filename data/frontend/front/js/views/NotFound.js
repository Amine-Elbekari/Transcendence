import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("404 Not Found");
    }

    async getHtml() {
        return `
            <h1>404 Not Found</h1>
            <p>The page you are looking for does not exist.</p>
            <p><a href="/" data-link>Back to Home</a></p>
        `;
    }
}