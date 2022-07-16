
import styled from "styled-components"

export const AlertWarning = styled.div.attrs(() => ({className : "alert alert-warning"}))`
    max-width: 800px;
    text-align: center;
    padding: 5px 20px 5px 20px;
    margin-left: auto;
    margin-right: auto;
`


export const AlertError = styled.div.attrs(() => ({className : "alert alert-danger"}))`
    max-width: 800px;
    text-align: center;
    padding: 5px 20px 5px 20px;
    margin-left: auto;
    margin-right: auto;
`


export const Alert = styled.div.attrs(() => ({className : "alert alert-primary"}))`
    max-width: 800px;
    text-align: center;
    padding: 5px 20px 5px 20px;
    margin-left: auto;
    margin-right: auto;
`