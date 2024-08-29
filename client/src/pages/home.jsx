import "../styles/home.css";
import { Link } from "react-router-dom";
function Home() {
  return (
    <>
      <div className="home_container">
        <div className="home_items">
          <h1>Welcome To The Mern Chat App</h1>
          <div className="login">
            <Link to="/login">Login/Signup</Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
