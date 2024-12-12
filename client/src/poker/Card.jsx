import BackCardImage from "../images/back-card.png";
import "../css/Card.css";
import cardImages from "../services/CardImages";

const CardOld = ({ position }) => {
  return <img className={`Card ${position}`} src={BackCardImage} />;
};

export default CardOld;
