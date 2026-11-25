import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
} from "react-router-dom";
import { BookList } from "./pages/BookList";
import { BookDetails } from "./pages/BookDetails";
import { NewBook, EditBook } from "./pages/BookEditor";
import "./styles.css";
function App() {
  const location = useLocation();
  const message: unknown = location.state?.message;
  return (
    <main>
      {typeof message === "string" && (
        <p role="status" className="success">
          {message}
        </p>
      )}
      <Routes>
        <Route path="/" element={<Navigate to="/books" replace />} />
        <Route path="/books" element={<BookList />} />
        <Route path="/books/new" element={<NewBook />} />
        <Route path="/books/:id" element={<BookDetails />} />
        <Route path="/books/:id/edit" element={<EditBook />} />
        <Route
          path="*"
          element={
            <>
              <h1>Страница не найдена</h1>
              <Link to="/books">К списку книг</Link>
            </>
          }
        />
      </Routes>
    </main>
  );
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
