import './App.css';
import { Routes, Route } from "react-router-dom";
import Home from './components/home/Home';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<Home/>}/>
      </Routes>
     
    </div>
  );
}

export default App;
