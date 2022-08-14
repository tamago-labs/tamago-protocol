import styled from "styled-components";


export const Button = styled.button`
    padding: 10px 20px;
    border: 0px;
    border-radius: 5px;
    box-shadow: 5px 5px black;
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
    Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    div {
        margin-top: auto;
        margin-bottom: auto;
    }
`

export const Button2 = styled.button`
    padding: 10px 20px;
    background: white;
    border: 1px solid black; 
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
    Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
    cursor: pointer;
    font-size: 14px;
    color: black;
    border-radius: 5px; 

    :hover {
        text-decoration: underline;
    }

`

export const ToggleButton = styled(Button)`
    opacity: 0.6;
    padding: 3px 10px;
    display: flex;
    flex-direction: row;

    img {
        height: 30px;
        width: 30px;
        margin: auto;
        border-radius: 50%;
        overflow: hidden;
        transform: translateX(-20%); 
    }

    div {
        margin-top: auto;
        margin-bottom: auto;
    }

   :hover {
          background: white;
          color: #333;
        }
          ${props => props.active && `
          opacity: 1;
      background: white;
      color: #333;
  
    `}
`