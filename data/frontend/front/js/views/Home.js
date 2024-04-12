import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Home");
    }

    async getHtml() {
        return `
                <h1>Home Page</h1>
                <button id="logoutButton" class="btn btn-primary btn-block">Log Out</button>
        `;
    }
}