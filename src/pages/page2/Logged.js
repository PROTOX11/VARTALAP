import React from "react";
import "./logged.css";
import Leftcontent from "../../components/Logged_left/leftcontent";
import Rightcontent from "../../components/Logged_right/rightcontent";
import Scroll from "../../components/scrollcontent/srcoll";
function Logged() {
    return (
        <>
        <Leftcontent />
        <Rightcontent />
        <Scroll />
        <Scroll />
        </>
    )
}
export default Logged;