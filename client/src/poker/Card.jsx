//import BackCardImage from "../images/back-card.png";
//import cardImages from "../services/CardImages";
import "../css/Card.css";

const Card = ({ position, card }) => {
  return <img className={`Card ${position}`} src={card} />;
};

export default Card;
