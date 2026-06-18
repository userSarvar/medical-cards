import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

const COLLECTION_NAME = "business_cards";

// Get all cards from the cloud
export const getCards = async () => {
  const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Add or Update a card
export const saveCard = async (card) => {
  if (card.id) {
    // Update existing
    const cardRef = doc(db, COLLECTION_NAME, card.id);
    await updateDoc(cardRef, card);
  } else {
    // Create new
    const docRef = await addDoc(collection(db, COLLECTION_NAME), card);
    return docRef.id;
  }
};

// Delete a card
export const deleteCard = async (id) => {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
};