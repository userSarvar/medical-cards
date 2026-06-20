import {
  collection, getDocs, addDoc, updateDoc,
  deleteDoc, doc, getDoc, setDoc
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Parses lat/lng from:
 * - Raw coords: "40.136731, 67.823765" or "40.136731,67.823765"
 * - Full Google Maps URL: https://maps.google.com/...@lat,lng...
 * - maps.app.goo.gl short links: we extract coords if embedded, otherwise null
 */
export function parseLatLng(input) {
  if (!input) return null;

  const str = input.trim();

  // 1. Raw coordinates: "40.136731, 67.823765"
  const rawCoords = str.match(/^(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)$/);
  if (rawCoords) {
    return { lat: rawCoords[1], lng: rawCoords[2] };
  }

  // 2. Full URL patterns
  const patterns = [
    /@(-?\d+\.\d+),(-?\d+\.\d+)/,           // @lat,lng
    /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/,      // ?q=lat,lng
    /ll=(-?\d+\.\d+),(-?\d+\.\d+)/,          // ll=lat,lng
    /place\/(-?\d+\.\d+),(-?\d+\.\d+)/,      // place/lat,lng
    /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,        // !3d lat !4d lng (embedded maps)
  ];

  for (const pattern of patterns) {
    const match = str.match(pattern);
    if (match) return { lat: match[1], lng: match[2] };
  }

  return null; // short links like maps.app.goo.gl can't be resolved client-side
}

export async function uploadToImgBB(file) {
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
  const formData = new FormData();
  formData.append("image", file);
  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  if (!data.success) throw new Error("Image upload failed");
  return data.data.url;
}

const COL = "business_cards";

export const getCards = async () => {
  const snap = await getDocs(collection(db, COL));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getCard = async (id) => {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

export const saveCard = async (card, logoFile, partnerLogoFiles = []) => {
  let logoUrl = card.logoUrl || "";
  if (logoFile) {
    logoUrl = await uploadToImgBB(logoFile);
  }

  // Upload any partner logos that came as File objects
  const partnerLogos = await Promise.all(
    (card.partnerLogos || []).map(async (p, i) => {
      const file = partnerLogoFiles[i];
      if (file instanceof File) {
        const url = await uploadToImgBB(file);
        return { ...p, logoUrl: url };
      }
      return p;
    })
  );

  const data = { ...card, logoUrl, partnerLogos };
  const docId = data.customId || undefined;
  delete data.id;
  delete data.customId;

  if (card.id) {
    await updateDoc(doc(db, COL, card.id), data);
    return card.id;
  } else {
    if (docId) {
      await setDoc(doc(db, COL, docId), data);
      return docId;
    } else {
      const docRef = await addDoc(collection(db, COL), data);
      return docRef.id;
    }
  }
};

export const deleteCard = async (id) => {
  await deleteDoc(doc(db, COL, id));
};