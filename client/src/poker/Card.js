import BackCardImage from "../images/back-card.png";
import "../css/Card.css";

const Card = ({ position }) => {
  return <img className={`Card ${position}`} src={BackCardImage} />;
};

export default Card;
