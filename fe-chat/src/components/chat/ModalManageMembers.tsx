// fe-chat/src/components/chat/ModalManageMembers.tsx - FIX COMPLETO
import { useState, useEffect } from 'react';
import { IoClose, IoAdd, IoRemove } from 'react-icons/io5';
import { UserService, ChatService } from '@/services';
import type { User } from '@/types/api';
import styles from '@/styles/modalManageMembers.module.css';

interface ModalManageMembersProps {
  chatId: string;
  chatName: string;
  currentMembers: string[];
  onClose: () => void;
  onMembersUpdated: (newMembers: string[]) => void; // ✅ Passa i nuovi membri
}

export default function ModalManageMembers({
  chatId,
  chatName,
  currentMembers,
  onClose,
  onMembersUpdated
}: ModalManageMembersProps) {
  const [members, setMembers] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Carica membri attuali
        const memberPromises = currentMembers.map(id => 
          UserService.getUserById(id).then(opt => opt)
        );
        const membersData = (await Promise.all(memberPromises))
          .filter(Boolean) as User[];
        setMembers(membersData);

        // Carica amici disponibili
        const allFriends = await UserService.getCurrentUserFriends();
        const availableFriends = allFriends.filter(
          friend => !currentMembers.includes(friend.id)
        );
        setFriends(availableFriends);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentMembers]);

  // ✅ FIX: Aggiungi membro con aggiornamento stato
  const handleAddMember = async (userId: string) => {
    if (updating) return;
    
    try {
      setUpdating(true);
      
      // Chiama API backend
      await ChatService.addParticipant(chatId, userId);
      
      // Aggiorna liste locali
      const addedFriend = friends.find(f => f.id === userId);
      if (addedFriend) {
        const newMembers = [...members, addedFriend];
        setMembers(newMembers);
        setFriends(prev => prev.filter(f => f.id !== userId));
        
        // ✅ Notifica al parent per refresh
        onMembersUpdated(newMembers.map(m => m.id));
      }
      
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Errore nell\'aggiunta del membro');
    } finally {
      setUpdating(false);
    }
  };

  // ✅ FIX: Rimuovi membro con aggiornamento stato
  const handleRemoveMember = async (userId: string) => {
    if (updating) return;
    
    if (!confirm('Rimuovere questo membro dal gruppo?')) return;

    try {
      setUpdating(true);
      
      // Chiama API backend
      await ChatService.removeParticipant(chatId, userId);
      
      // Aggiorna liste locali
      const removedMember = members.find(m => m.id === userId);
      if (removedMember) {
        const newMembers = members.filter(m => m.id !== userId);
        setMembers(newMembers);
        setFriends(prev => [...prev, removedMember]);
        
        // ✅ Notifica al parent per refresh
        onMembersUpdated(newMembers.map(m => m.id));
      }
      
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Errore nella rimozione del membro');
    } finally {
      setUpdating(false);
    }
  };

  const filteredMembers = members.filter(m =>
    m.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFriends = friends.filter(f =>
    f.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Gestione Membri - {chatName}</h2>
          <button 
            className={styles.closeBtn} 
            onClick={onClose} 
            disabled={updating}
            title="Chiudi finestra"
          >
            <IoClose />
          </button>
        </div>

        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Cerca..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={styles.searchInput}
            disabled={updating}
          />
        </div>

        <div className={styles.content}>
          {loading ? (
            <div className={styles.loading}>Caricamento...</div>
          ) : (
            <>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  Membri Attuali ({filteredMembers.length})
                </h3>
                <div className={styles.memberList}>
                  {filteredMembers.map(member => (
                    <div key={member.id} className={styles.memberItem}>
                      <div className={styles.memberInfo}>
                        <div className={styles.avatar}>
                          {member.username.charAt(0).toUpperCase()}
                        </div>
                        <span className={styles.username}>{member.username}</span>
                      </div>
                      <button
                        className={`${styles.actionBtn} ${styles.removeBtn}`}
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={updating}
                        title="Rimuovi dal gruppo"
                      >
                        <IoRemove />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {filteredFriends.length > 0 && (
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>
                    Aggiungi Amici ({filteredFriends.length})
                  </h3>
                  <div className={styles.memberList}>
                    {filteredFriends.map(friend => (
                      <div key={friend.id} className={styles.memberItem}>
                        <div className={styles.memberInfo}>
                          <div className={styles.avatar}>
                            {friend.username.charAt(0).toUpperCase()}
                          </div>
                          <span className={styles.username}>{friend.username}</span>
                        </div>
                        <button
                          className={`${styles.actionBtn} ${styles.addBtn}`}
                          onClick={() => handleAddMember(friend.id)}
                          disabled={updating}
                          title="Aggiungi al gruppo"
                        >
                          <IoAdd />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}