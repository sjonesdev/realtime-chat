import { useNavigate } from "@solidjs/router";
import { Button } from "@suid/material";

export default () => {
    const navigate = useNavigate();
    return (
        <>
            <h1>Welcome to Realtime Chat App</h1>
            <Button onClick={() => navigate("/register")}>Sign Up</Button>
            <Button onClick={() => navigate("/login")}>Sign In</Button>
        </>
    );
};
