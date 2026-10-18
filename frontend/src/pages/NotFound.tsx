import { Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

function NotFound() {
  return (
    <MainLayout>
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/">Back to the dashboard</Link>
    </MainLayout>
  );
}

export default NotFound;
