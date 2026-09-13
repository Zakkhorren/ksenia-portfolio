import { render } from "@solidjs/web";
import App from "./App";
import "./styles/site.css";
import "./styles/home.css";
import "./styles/revision.css";
import "./styles/header.css";
import "./styles/logofolio.css";
import "./styles/marketplace.css";
import "./styles/app.css";
import "./styles/case-revision.css";
import "./styles/final-revision.css";

const root = document.getElementById("app");
if (!root) throw new Error("Application root is missing");
render(() => <App />, root);
