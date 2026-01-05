import { GiCrossMark } from "react-icons/gi";
import { UserService } from "@/services";
import { useEffect, useState, useCallback } from "react";
import {  User } from "@/types/api";
import style from "@/styles/modalAddFriend.module.css";

interface FuncProps {
  onAddFriendClick: (condition: boolean) => void;
}

export default function ModalAddFriend({ onAddFriendClick }: FuncProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<User[]>([]);

  useEffect(() => {
    const fetchCurrentFriends = async () => {
      try {
        const userFriends = await UserService.getCurrentUserFriends();
        setFriends(userFriends);
      } catch (error) {
        console.error("Errore nel caricamento degli amici:", error);
      }
    };
    fetchCurrentFriends();
  }, []);

  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const results = await UserService.searchUsers(searchTerm) as User[];
      const filteredResults = results.filter(user => 
        !friends.some(friend => friend.id === user.id)
      );
      setSearchResults(filteredResults);
    } catch (error) {
      console.error("Errore nella ricerca degli utenti:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, friends]);

  const handleSendFriendRequest = async (userId: string) => {
    try {
      await UserService.sendFriendRequest(userId);
      setSearchResults(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error("Errore nell'invio della richiesta di amicizia:", error);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, handleSearch]);

  const isAlreadyFriend = (userId: string) => {
    return friends.some(friend => friend.id === userId);
  };

  return (
    <div className={style["create-group-container"]}>
      <div className={style.icon} onClick={() => onAddFriendClick(false)}>
        <GiCrossMark />
      </div>
      <div className={style.title}>Aggiungi Amico</div>
      
      <div className={style["search-input"]}>
        <input
          type="text"
          placeholder="Cerca utenti per username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={style["member-list"]}>
        {loading ? (
          <div className={style["no-results"]}>Ricerca in corso...</div>
        ) : searchResults.length > 0 ? (
          searchResults.map((user) => (
            <div className={style["member-item"]} key={user.id}>
              <div className={style["user-info"]}>
                <div className={style.username}>{user.username}</div>


                  <div className={style["user-actions"]}>
                  {isAlreadyFriend(user.id) ? (
                    <button className={style["already-friend-btn"]} disabled>
                      Già amico
                    </button>
                  ) 
                  : (
                    <button 
                      onClick={() => handleSendFriendRequest(user.id)}
                      className={style["add-friend-btn"]}
                    >
                      Aggiungi
                    </button>
                  )}
                </div>
              </div>
              

            </div>
          ))
        ) : searchTerm ? (
          <div className={style["no-results"]}>Nessun utente trovato per la ricerca</div>
        ) : (
          <div className={style["no-results"]}>Inserisci un username per cercare nuovi amici</div>
        )}
      </div>
    </div>
  );
}