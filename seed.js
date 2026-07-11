import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB2rErWOHsMLsUEoCrINJ2DzKv9WLC7fy8",
  authDomain: "app-barbeiros-93ebb.firebaseapp.com",
  projectId: "app-barbeiros-93ebb",
  storageBucket: "app-barbeiros-93ebb.firebasestorage.app",
  messagingSenderId: "634674722638",
  appId: "1:634674722638:web:1e1c0983d7587b75e7901f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const INITIAL_USERS = [
  { cpf: "00000000000", name: "Brunno", role: "admin" },
  { cpf: "111", name: "Daniel Jordan", xp: 4500, role: "barber", pillars: { resultado: 85, relacionamento: 78, tecnica: 90, imagem: 92, cultura: 70 } },
  { cpf: "222", name: "Reidner", xp: 3200, role: "barber", pillars: { resultado: 72, relacionamento: 80, tecnica: 75, imagem: 88, cultura: 65 } },
  { cpf: "333", name: "Yuri Graff", xp: 1500, role: "barber", pillars: { resultado: 55, relacionamento: 70, tecnica: 60, imagem: 75, cultura: 50 } },
  { cpf: "444", name: "Diogo Rafael", xp: 1200, role: "barber", pillars: { resultado: 50, relacionamento: 65, tecnica: 55, imagem: 70, cultura: 45 } },
  { cpf: "555", name: "Felipe Gonçalves", xp: 400, role: "barber", pillars: { resultado: 30, relacionamento: 60, tecnica: 35, imagem: 65, cultura: 40 } },
];

async function seed() {
  console.log("Seeding Firebase...");
  try {
    for (const u of INITIAL_USERS) {
      const ref = doc(db, "users", u.cpf);
      if (u.role === "admin") {
        await setDoc(ref, { name: u.name, role: u.role }, { merge: true });
      } else {
        await setDoc(ref, { name: u.name, role: u.role, xp: u.xp, pillars: u.pillars }, { merge: true });
      }
      console.log(`User ${u.name} seeded!`);
    }
    console.log("Done!");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

seed();
