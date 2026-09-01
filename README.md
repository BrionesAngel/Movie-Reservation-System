# Movie Reservation System
## Stack: Spring Boot 4 + Angular 22 + PostgreSQL + Docker

### Backend (Java 25, Gradle)
- Auth: JWT-based (15min access + 7-day refresh tokens with BCrypt hashing, rotation, revocation)
- Features: Movies, Genres (22 seeded), Rooms (5), Seats (124/room), Showtimes, Reservations, Payments (Stripe, MXN)
- Key patterns: Optimistic locking on seat reservations, 5-minute payment window, scheduled job every 60s to expire unpaid reservations, Stripe webhook for async payment status
- Extras: Springdoc OpenAPI (Swagger), WebSocket (STOMP), Flyway migrations (15), Lombok

### Frontend (Angular 22, Tailwind 4, Bun)
- Auth: Login/Register with reactive forms, JWT interceptors (attach token + auto-refresh on 401), route guards (authGuard/guestGuard/adminGuard)
- Services: AuthService (signals-based), WebSocketService (STOMP/SockJS), UiFeedbackService (toastr + SweetAlert2), MovieService, ShowtimeService, ReservationService, GenreService, RoomService, UserService
- User UI: Movies grid (only movies with active showtimes), Showtimes by day with date navigator, movie detail, seat selection grid, Stripe Elements payment, my reservations page
- Admin UI: Movie CRUD, showtime creation, all-reservations table, user promotion

## Backend Endpoints Added for the UI
- `GET /api/users` — list all users (admin)
- `GET /api/reservations/mine` — current user's reservations
- `GET /api/genres` — list genres
- `GET /api/rooms` — list rooms
- `ReservationSummaryResponse` now includes `showtimeId`


## Environment Variables
Create a `.env` file in the root directory and configure the required environment variables.
