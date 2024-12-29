import { useRef, useState } from "react";
import styled from "styled-components";
import smallerCard from "../images/smallerBackCard.png";
//import "./styles.css";


const Container = styled.div`
  position: absolute;
  overflow: hidden;
  :hover {
    box-shadow: 0 14px 24px rgba(0, 0, 0, 0.55), 14px 24px rgba(0, 0, 0, 0.55);
  }
`;

const Image = styled.img.attrs((props) => ({
  src: props.source,
}))``;


export default function CardTry({ position, card }) {

  const [offset, setOffset] = useState({ width: "70%", height: "70%" });
  const [paddingLeft, setPaddingLeft] = useState("15%");

  const handleMouseEnter = () => {
    setOffset({ width: "100%", height: "100%" });
    setPaddingLeft("0%");
  };

  const handleMouseLeave = () => {
    setOffset({ width: "70%", height: "70%" });
    setPaddingLeft("15%");
  }

//   const handleMouseMove = (e) => {
//     console.log("here");
//     const targetRect = targetRef.current.getBoundingClientRect();
//     const sourceRect = sourceRef.current.getBoundingClientRect();
//     const containerRect = containerRef.current.getBoundingClientRect();

//     const xRatio = (targetRect.width - containerRect.width) / sourceRect.width;
//     const yRatio =
//       (targetRect.height - containerRect.height) / sourceRect.height;

//     const left = Math.max(
//         Math.min(e.pageX - sourceRect.left, sourceRect.width),
//         0
//     );
//     const top = Math.max(
//         Math.min(e.pageY - sourceRect.top, sourceRect.height),
//         0
//     );

//     setOffset({
//       left: left * -xRatio,
//       top: top * -yRatio,
//     });
//   };

  return (
    <div style={{ justifyContent: "center", alignItems: "center"}} className={`Card ${position}`}>
      <Container
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Image style={{paddingLeft: paddingLeft}} width={offset.width} height={offset.height} alt="source" source={card} />
      </Container>
    </div>
  );
}
