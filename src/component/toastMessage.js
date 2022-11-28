import { useState } from "react";
import { Toast } from "react-bootstrap";
import Badge from "react-bootstrap/Badge";
import Popover from 'react-bootstrap/Popover';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Button from 'react-bootstrap/Button';

const popover = (text) => (
    <Popover id="popover-basic" className="superTop">
        <Popover.Body>
            {JSON.stringify(text)}
        </Popover.Body>
    </Popover>
);

const overlay = (text, level) => {
    let clsName = `btn m-0 py-0 px-2 btn-${level}`
    return (
        <span>&nbsp;
            <OverlayTrigger trigger="click" placement="bottom" overlay={popover(text)}>
                <Button className={clsName}>?</Button>
            </OverlayTrigger>
        </span>
    )
};

export const ErrorToast = ({ header, message, err }) => {
    return (
        <ToastMessage header={header} message={message} hoverText={err} level="danger" />
    )
    /*
    const [show, setShow] = useState(true);
    const toggleShow = () => setShow(!show);
    return (
        <Toast show={show} onClose={toggleShow}>
            <Toast.Header>
                <Badge bg="danger">!</Badge>&nbsp;
                <strong className="me-auto">{header}</strong>
            </Toast.Header>
            <Toast.Body>
                {message}&nbsp;
                {err && overlay(err)}
            </Toast.Body>
        </Toast>
    );
    */
};

export const ToastMessage = ({ header, message, hoverText, badge = "!", level = "primary" }) => {
    const [show, setShow] = useState(true);
    const toggleShow = () => setShow(!show);
    return (
        <Toast show={show} onClose={toggleShow}>
            <Toast.Header>
                <Badge bg={level}>{badge}</Badge>&nbsp;
                <strong className="me-auto">{header}</strong>
            </Toast.Header>
            <Toast.Body>
                {message}
                {hoverText && overlay(hoverText, level)}
            </Toast.Body>
        </Toast>
    );
};