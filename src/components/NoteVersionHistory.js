import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../firebase';
import { Button, Modal, ListGroup } from 'react-bootstrap';

const NoteVersionHistory = ({ noteId, onClose }) => {
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVersions = async () => {
            const versionsCollectionRef = collection(firestore, 'notes', noteId, 'versions');
            const versionSnapshots = await getDocs(versionsCollectionRef);
            const versionsList = versionSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setVersions(versionsList);
            setLoading(false);
        };

        fetchVersions();
    }, [noteId]);

    const revertToVersion = async (versionId) => {
        const versionDocRef = doc(firestore, 'notes', noteId, 'versions', versionId);
        const versionSnapshot = await getDoc(versionDocRef);

        if (versionSnapshot.exists()) {
            const versionData = versionSnapshot.data();

            // Get current note data
            const noteRef = doc(firestore, 'notes', noteId);
            const currentNoteSnapshot = await getDoc(noteRef);

            if (currentNoteSnapshot.exists()) {
                const currentNoteData = currentNoteSnapshot.data();

                // Save current note data as a new version
                const versionsCollectionRef = collection(firestore, 'notes', noteId, 'versions');
                await addDoc(versionsCollectionRef, {
                    title: currentNoteData.title,
                    content: currentNoteData.content,
                    category: currentNoteData.category,
                    timestamp: serverTimestamp(),
                });

                // Update note with the selected version's data
                await updateDoc(noteRef, {
                    title: versionData.title,
                    content: versionData.content,
                    category: versionData.category,
                    timestamp: serverTimestamp(),
                });
            }

            onClose(); // Close the modal after reverting
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <Modal show={true} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Version History</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ListGroup>
                    {versions.map(version => (
                        <ListGroup.Item key={version.id}>
                            <p>Title: {version.title}</p>
                            <p>Content: {version.content}</p>
                            <p>Category: {version.category}</p>
                            <p>Timestamp: {version.timestamp?.toDate().toString()}</p>
                            <Button onClick={() => revertToVersion(version.id)}>Revert to this version</Button>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Modal.Body>
        </Modal>
    );
};

export default NoteVersionHistory;

