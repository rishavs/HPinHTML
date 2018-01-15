import { h } from "hyperapp";

import Navbar from './Navbar.js'

const Layout = (props, page)  => h("div",{class:"container"}, [
        h(Navbar),
        h("article", {}, page),
    ])  

export default Layout