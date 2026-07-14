export const metadata = { title: "Politica de Confidențialitate — connectiv" };

export default function PrivacyPage() {
  return (
    <article>
      <h1>Politica de Confidențialitate</h1>
      <p className="updated">Ultima actualizare: 14 iulie 2026</p>

      <p>
        <strong>Notă importantă:</strong> Acest document este un model generic pentru etapa
        inițială a aplicației connectiv și nu constituie consultanță juridică. Pentru conformitate
        deplină cu Regulamentul General privind Protecția Datelor (GDPR) la scara unei aplicații
        reale, recomandăm revizuirea de către un avocat specializat sau un responsabil cu
        protecția datelor (DPO).
      </p>

      <h2>1. Ce date colectăm</h2>
      <ul>
        <li>Date de cont: nume, email, oraș, tip cont (personal/companie), poză de profil</li>
        <li>Conținut: postări video/text, story-uri, comentarii, reacții, mesaje private</li>
        <li>Date tehnice: adresă IP (pentru limitarea abuzurilor), tip dispozitiv, jurnale de erori</li>
      </ul>

      <h2>2. Cum folosim datele</h2>
      <ul>
        <li>Pentru a-ți crea și administra contul</li>
        <li>Pentru a afișa conținutul tău altor utilizatori, conform setărilor Serviciului</li>
        <li>Pentru a preveni abuzul (rate limiting, protecție brute-force)</li>
        <li>Pentru a comunica cu tine (ex. confirmarea contului prin email)</li>
      </ul>

      <h2>3. Cu cine partajăm datele</h2>
      <p>
        Nu vindem datele tale. Folosim furnizori terți strict pentru funcționarea tehnică a
        Serviciului: găzduire bază de date și stocare video (Supabase), găzduire aplicație
        (Vercel), monitorizare erori (Sentry). Acești furnizori procesează date exclusiv în numele
        nostru, conform contractelor lor de procesare a datelor.
      </p>

      <h2>4. Drepturile tale (GDPR)</h2>
      <p>Ca persoană vizată în UE, ai dreptul să:</p>
      <ul>
        <li>Accesezi datele pe care le deținem despre tine</li>
        <li>Corectezi date incorecte (din Setări → Profil)</li>
        <li>Ștergi contul și datele asociate (Setări → Șterge contul)</li>
        <li>Retragi consimțământul acordat, în orice moment</li>
        <li>Depui o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP)</li>
      </ul>

      <h2>5. Ștergerea contului</h2>
      <p>
        Ștergerea contului din Setări este permanentă și elimină profilul, postările, story-urile,
        mesajele și reacțiile asociate. Unele date pot fi păstrate un timp limitat dacă legea o
        cere (ex. obligații fiscale) sau în copii de backup tehnice, care se rotesc automat.
      </p>

      <h2>6. Securitate</h2>
      <p>
        Folosim conexiuni criptate (HTTPS), politici de acces la nivel de rând (RLS) în baza de
        date și limitare a ratei cererilor pentru a reduce riscul de acces neautorizat. Niciun
        sistem nu este 100% sigur, dar tratăm securitatea datelor tale ca prioritate.
      </p>

      <h2>7. Cookie-uri</h2>
      <p>
        Folosim cookie-uri strict necesare funcționării Serviciului (sesiune de autentificare,
        preferință de oraș, preferință de limbă). Nu folosim cookie-uri de tracking publicitar.
      </p>

      <h2>8. Contact</h2>
      <p>
        Pentru cereri legate de datele tale personale, ne poți contacta prin secțiunea de Setări
        din aplicație.
      </p>
    </article>
  );
}
