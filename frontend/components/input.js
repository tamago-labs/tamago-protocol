
import styled from "styled-components";

export const Options = styled(
    ({ className, options, setter, getter, disabled }) => {
        return (
            <select className={className} disabled={disabled} value={getter} onChange={(e) => setter(Number(e.target.value))} id="cars" name="cars">
                {options.map((v, i) => {
                    return (
                        <option value={v[0]} key={i}>
                            {v[1]}
                        </option>
                    )
                })
                }
            </select>
        )
    }
)`

padding: 5px 10px;
cursor: pointer;
border-radius: 5px;
box-shadow: 3px 3px;

`

export const OptionsLarge = styled(Options)`
    font-size: 20px;
    padding: 10px 20px;
    border-radius: 5px;
    box-shadow: 5px 5px;
    width: 250px;

`

export const InputGroup = styled.div`
    display: flex;
    align-content: stretch; 

    >input {
        flex: 1 0 auto;
    }

    .input-group-addon {
        background: #eee; 
        border: 1px solid #ccc;
        padding: 5px; 
      }

`

