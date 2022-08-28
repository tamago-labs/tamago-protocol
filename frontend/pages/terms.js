import styled from "styled-components";
import Container from "../components/container"


const Title = styled.div`
    border-top: 1px solid white;
    border-bottom: 1px solid white; 
    padding: 30px 20px;
    margin-top: 1rem;
    font-size: 28px;
`

const Body = styled.div` 
    font-size: 18px;
    line-height: 24px;
    padding: 20px;
    p {
        margin-bottom: 2rem;
    }

    padding-bottom: 4rem;

`

const Terms = () => {
    return (
        <div>
            <Title>
                <Container>
                    Terms & Conditions
                </Container>
            </Title>
            <Body>
                <Container>
                    <h3>
                        USE OF INFORMATION
                    </h3>
                    <p>
                        For our Clients, we use personal information mainly to provide the Services and contact our Clients regarding account activities, new versions, and product offerings, or other communications relevant to the Services. We do not sell or share any personally identifiable or other information of End Users to any third parties, except, of course, to the applicable Client whose website you are using.
                    </p>
                    <p>
                        If you contact us by email or by filling out a registration form, we may keep a record of your contact information and correspondence and may use your email address, and any information that you provide to us in your message, to respond to you. In addition, we may use the personal information described above to send you information regarding the Service. If you decide at any time that you no longer wish to receive such information or communications from us, email us at and request to be removed from our list. The circumstances under which we may share such information with third parties are described below in “Complying with Legal Process”.
                    </p>
                    <h3>
                        STORAGE AND SECURITY OF INFORMATION
                    </h3>
                    <p>
                        It's operates secure data networks protected by industry-standard firewalls and password protection systems. Our security and privacy policies are periodically reviewed and enhanced as necessary, and only authorized individuals have access to the information provided by our Clients.
                    </p>
                    <h3>
                        PERSONALLY IDENTIFIABLE INFORMATION
                    </h3>
                    <p>
                        If you are a Client, when you register with us via our Website, we will ask you for some personally identifiable information, such as your first and last name, company name, email address, billing address, and credit card information. You may review and update this personally identifiable information in your profile by logging in and editing such information on your dashboard. If you decide to delete all of your information, we may cancel your account. We may retain an archived copy of your records as required by law or for reasonable business purposes.
                    </p>
                    <p>
                        Due to the nature of the Service, except to assist Clients with certain limited technical problems or as otherwise legally compelled, we will not access any of the Content that you upload to the Service.
                    </p>
                    <p>
                        Some Personally Identifiable Information may also be provided to intermediaries and third parties who assist us with the Service, but who may make no use of any such information other than to assist us in providing the Service. Except as otherwise provided in this Privacy Policy, however, we will not rent or sell your Personally Identifiable Information to third parties.
                    </p>
                    <p>
                        Last updated Aug 28, 2022
                    </p>
                </Container>

            </Body>
        </div>
    )
}

export default Terms