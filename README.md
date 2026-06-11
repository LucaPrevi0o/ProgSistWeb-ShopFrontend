# Shop Frontend

Frontend Angular per il progetto full-stack di *Progetto di Sistemi Web*.
L'applicazione usa un backend reale Ruby on Rails al posto di dati mock per prodotti, carrello, checkout, ordini, autenticazione e funzionalità admin.

## Tecnologie

- Angular `21.1.1`
- Angular CLI `21.1.1`
- TypeScript `5.9.3`
- Node.js `22.22.1`
- npm `9.2.0`
- RxJS
- Angular Router
- Standalone components
- Angular HTTP interceptor
- SCSS

## Quick Start Full Stack

Terminale backend:

```bash
cd shop-backend
bundle install
bin/rails db:create db:migrate db:seed
bin/rails server
```

Terminale frontend:

```bash
cd shop-frontend
npm install
npm start
```

Aprire:

```text
http://localhost:4200
```

Il backend Rails deve essere disponibile su:

```text
http://localhost:3000
```

## Setup Frontend

Installare le dipendenze:

```bash
npm install
```

Avviare in sviluppo:

```bash
npm start
```

Build di produzione:

```bash
npm run build
```

La build viene generata in:

```text
dist/shop-frontend
```

## Configurazione API

L'URL base del backend è definito in:

```text
src/app/app.config.ts
```

Valore locale atteso:

```ts
export const API_BASE_URL = 'http://localhost:3000';
```

## Rotte Applicative

### Pubbliche

```text
/
/products
/product/:id
/login
/register
```

### Utente autenticato

```text
/cart
/checkout
/orders
/orders/:id
/users/:id
```

### Admin

```text
/admin
/admin/products
/admin/orders
/admin/orders/:id
/admin/users
```

Le rotte utente sono protette da `AuthGuard`.
Le rotte admin sono protette da `AdminGuard` e richiedono ruolo `ADMIN`.

## Servizi Principali

- `UserService`: login, registrazione, utente corrente, logout, aggiornamento profilo.
- `ProductService`: lista prodotti, dettaglio prodotto, categorie, filtri e paginazione.
- `CartService`: caricamento carrello, aggiunta, aggiornamento, rimozione e svuotamento.
- `CheckoutService`: invio checkout a `POST /orders` e lettura risposta `{ orderId }`.
- `OrderService`: lista ordini utente, dettaglio ordine, filtri e lettura ordini admin.
- `AdminService`: dati admin corrente, CRUD prodotti, lista utenti, aggiornamento stato ordine.

L'`AuthInterceptor` aggiunge automaticamente il token JWT alle richieste quando presente in `localStorage`.

## Modelli Frontend

- `Product`: prodotto del catalogo.
- `Cart` e `CartItem`: carrello persistente restituito dal backend.
- `Order`: ordine con articoli, totale, stato, data, dati personali e pagamento.
- `User`: account autenticato con ruolo.
- `UserInfo`, `PersonalData`, `Address`, `PaymentMethod`: dati profilo e checkout.

## Flusso Applicativo

1. L'utente si registra o effettua login.
2. Il token JWT viene salvato lato client.
3. L'interceptor allega il token alle richieste protette.
4. L'utente naviga catalogo e dettaglio prodotto caricati dal backend.
5. L'utente modifica il carrello; ogni modifica viene sincronizzata con Rails.
6. Il checkout invia dati personali, pagamento e articoli a `POST /orders`.
7. Il backend risponde con `{ orderId }`.
8. L'utente consulta storico ordini e dettaglio ordine.
9. L'admin gestisce prodotti e puo confermare o annullare ordini.

## Funzionalità Avanzate

- Area admin protetta.
- Gestione prodotti admin: creazione, modifica, eliminazione.
- Consultazione ordini admin con dettaglio completo.
- Conferma o annullamento ordine da admin.
- Lista utenti registrati lato admin.
- Filtri nella lista ordini utente per stato e intervallo date.
- Filtri nella gestione prodotti admin.
- UI con stati di loading, empty state ed error state tramite `toHttpState`.

## Test e Verifica

Build frontend:

```bash
npm run build
```

Flusso manuale utente:

1. Avviare backend e frontend.
2. Registrare un utente.
3. Effettuare login.
4. Aprire catalogo e dettaglio prodotto.
5. Aggiungere prodotti al carrello.
6. Ricaricare la pagina e verificare che il carrello persista.
7. Completare checkout.
8. Aprire lista ordini e dettaglio ordine.
9. Usare i filtri per stato/data nella lista ordini.

Flusso manuale admin:

1. Effettuare login con un utente `ADMIN`.
2. Aprire `/admin`.
3. Creare, modificare ed eliminare un prodotto.
4. Consultare lista ordini e dettaglio ordine.
5. Confermare o annullare un ordine.
6. Consultare la lista utenti registrati.

## Note

Questo repository contiene solo il frontend Angular.
Il backend Rails è in un repository separato e deve essere avviato per usare l'applicazione completa.
