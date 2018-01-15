import { h } from "hyperapp";
import { Link, Route, location } from "@hyperapp/router";

const Navbar = h("nav", [
    h(Link, {"to": "/" }, "Home"),
    h(Link, {"to": "/About" }, "About")
])

export default Navbar