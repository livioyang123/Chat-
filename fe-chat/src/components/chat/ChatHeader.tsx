import { useEffect, useRef, useState } from "react";
import { AiOutlineMore } from "react-icons/ai";
import { MdGroups3 } from "react-icons/md";
import { GiAngelOutfit } from "react-icons/gi";
import { MdOutlineAddCircleOutline } from "react-icons/md";
import style from "@/styles/chatWindow.module.css";

interface ChatHeaderProps {
    onBtnClick: (condition: boolean) => void;
    onAddFriendClick: (condition: boolean) => void;
}

export default function ChatHeader({ onBtnClick, onAddFriendClick }: ChatHeaderProps) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const logout = () => {
        window.location.href = "/"; // Redirect to login page
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={style["chat-header"]} ref={dropdownRef}>
            <h1 className={style[".h1"]}>Chat</h1>

            <div
                className={style["add-btn"]}
                onClick={() => {
                    onAddFriendClick(true);
                    setOpen(false);
                }}
            >
                <MdOutlineAddCircleOutline />
            </div>

            <div
                className={style["create-chat"]}
                onClick={() => setOpen(!open)}
            >
                <AiOutlineMore />
            </div>

            {open && (
                <div className={style["dropdown-menu"]}>
                    <div
                        className={style["dropdown-item"]}
                        onClick={() => {
                            onBtnClick(true);
                            setOpen(false);
                        }}
                    >
                        <MdGroups3 className={style["icon"]} />
                        <div className={style["desc"]}>nuovo gruppo</div>
                    </div>

                    <div
                        className={style["dropdown-item"]}
                        onClick={() => logout()}
                    >
                        <GiAngelOutfit className={style["icon"]} />
                        <div className={style["desc"]}>logout</div>
                    </div>
                </div>
            )}
        </div>
    );
}