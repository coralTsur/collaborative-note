import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, onSnapshot, getDoc, serverTimestamp } from 'firebase/firestore';
import { firestore, auth } from '../firebase';
import { Container, Form, Button, Card, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import NoteVersionHistory from './NoteVersionHistory';

const Notes = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [notes, setNotes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [editingNote, setEditingNote] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [editCategory, setEditCategory] = useState('');
    const [showAllNotes, setShowAllNotes] = useState(true);
    const [showVersionHistory, setShowVersionHistory] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (!user) {
                navigate('/signin'); // Redirect to sign-in page if user is not logged in
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(firestore, 'notes'), (snapshot) => {
            let updatedNotes = [];
            snapshot.forEach((doc) => {
                updatedNotes.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            setNotes(updatedNotes);
            fetchCategories(updatedNotes);
        });

        return () => unsubscribe();
    }, []);

    const fetchCategories = (notes) => {
        const uniqueCategories = [...new Set(notes.map(note => note.category))];
        setCategories(uniqueCategories);
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (title && content && category) {
            try {
                await addDoc(collection(firestore, 'notes'), {
                    title,
                    content,
                    category,
                    timestamp: serverTimestamp(),
                });
                setTitle('');
                setContent('');
                setCategory('');
            } catch (e) {
                console.error('Error adding document: ', e);
            }
        }
    };

    const handleDeleteNote = async (id) => {
        try {
            await deleteDoc(doc(firestore, 'notes', id));
        } catch (e) {
            console.error('Error deleting document: ', e);
        }
    };

    const handleEditNote = (note) => {
        setEditingNote(note.id);
        setEditTitle(note.title);
        setEditContent(note.content);
        setEditCategory(note.category);
    };

    // Function to save a version before updating a note
    const saveNoteVersion = async (noteId, noteData) => {
        const versionRef = collection(firestore, 'notes', noteId, 'versions');
        await addDoc(versionRef, {
            ...noteData,
            timestamp: serverTimestamp(),
        });
    };

// Update Note Function with Versioning
    const handleSaveEdit = async (id) => {
        try {
            const noteRef = doc(firestore, 'notes', id);
            const noteSnapshot = await getDoc(noteRef);
            if (noteSnapshot.exists()) {
                const noteData = noteSnapshot.data();
                await saveNoteVersion(id, noteData);
                await updateDoc(noteRef, {
                    title: editTitle,
                    content: editContent,
                    category: editCategory,
                    timestamp: serverTimestamp(),
                });
                setEditingNote(null);
            }
        } catch (e) {
            console.error('Error updating document: ', e);
        }
    };

    const handleShowAllNotes = () => {
        setSelectedCategory('');
        setShowAllNotes(true);
    };

    const handleShowByCategory = (cat) => {
        setSelectedCategory(cat);
        setShowAllNotes(false);
    };

    const filteredNotes = showAllNotes
        ? notes
        : notes.filter(note => note.category === selectedCategory);

    return (
        <Container className="text-center mt-5">
         {/* Add Note Frame */}
            <Card className="mb-4 mx-auto" style={{ maxWidth: '600px' }}>
                <Card.Body>
                    <h2>Add Note</h2>
                    <Form onSubmit={handleAddNote}>
                        <Form.Group controlId="formTitle">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formContent">
                            <Form.Label>Content</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Enter content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formCategory">
                            <Form.Label>Category</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="mr-2"
                                style={{ marginTop: '20px' }}
                        >
                            Add Note
                        </Button>
                    </Form>
                </Card.Body>
            </Card>

            {/* Filter Buttons */}
            <div className="mb-4">
                <Button
                    variant="outline-primary"
                    style={{ marginRight: '10px' }}
                    className="ml-2"
                    onClick={handleShowAllNotes}
                    active={showAllNotes}
                >
                    Show All Notes
                </Button>

                {categories.map((cat, index) => (
                    <Button
                        key={index}
                        variant="outline-primary"
                        style={{ marginRight: '10px' }}
                        className="ml-2 "
                        onClick={() => handleShowByCategory(cat)}
                        active={!showAllNotes && cat === selectedCategory}
                    >
                        Show {cat} Notes
                    </Button>
                ))}
            </div>

            {/* Display Notes */}
            <Row className="justify-content-center">
                {filteredNotes.map(note => (
                    <Col key={note.id} xs={12} md={4} className="mb-4">
                        <Card>
                            <Card.Body>
                                {editingNote === note.id ? (
                                    <>
                                        <Form.Group controlId="editTitle">
                                            <Form.Control
                                                type="text"
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                            />
                                        </Form.Group>
                                        <Form.Group controlId="editContent">
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                            />
                                        </Form.Group>
                                        <Form.Group controlId="editCategory">
                                            <Form.Control
                                                type="text"
                                                value={editCategory}
                                                onChange={(e) => setEditCategory(e.target.value)}
                                            />
                                        </Form.Group>
                                        <Button
                                            variant="success"
                                            className="mt-3"
                                            onClick={() => handleSaveEdit(note.id)}
                                        >
                                            Save
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Card.Title>{note.title}</Card.Title>
                                        <Card.Text>{note.content}</Card.Text>
                                        <Card.Text>
                                            <small className="text-muted">Category: {note.category}</small>
                                        </Card.Text>
                                        <Button
                                            variant="danger"
                                            onClick={() => handleDeleteNote(note.id)}
                                        >
                                            Delete
                                        </Button>
                                        <Button
                                            variant="primary"
                                            className="ml-2"
                                            onClick={() => handleEditNote(note)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            className="ml-2"
                                            onClick={() => setShowVersionHistory(note.id)}
                                        >
                                            Revert Versions
                                        </Button>
                                    </>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Version History Modal */}
            {showVersionHistory && (
                <NoteVersionHistory
                    noteId={showVersionHistory}
                    onClose={() => setShowVersionHistory(null)}
                />
            )}
        </Container>
    );
};

export default Notes;
