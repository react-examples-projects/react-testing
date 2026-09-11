import { BrowserRouter, Routes, Route } from "react-router";

import App from "./App";
import Signup from "@/pages/Signup";

export default function MainRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  );
}
