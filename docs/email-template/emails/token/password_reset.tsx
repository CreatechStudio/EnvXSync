import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
} from '@react-email/components';

interface EnvXSyncResetPasswordProps {
    verificationCode?: string;
}

export default function EnvXSyncResetPassword({
    verificationCode,
}: EnvXSyncResetPasswordProps) {
    return (
        <Html>
            <Head />
            <Body style={main}>
                <Preview>EnvXSync Reset Passwod</Preview>
                <Container style={container}>
                    <Section style={coverSection}>
                        <Section style={imageSection}>
                            <Img
                                src="https://cdn.createchstudio.com/CreatechStudioLogo/CreatechStudio-small-xtext.png"
                                height="48"
                                alt="EnvXSync Logo"
                            />
                        </Section>
                        <Section style={upperSection}>
                            <Heading style={h1}>You are resetting your password</Heading>
                            <Section style={verificationSection}>
                                <Text style={verifyText}>Verification code</Text>
                                <Text style={codeText}>{verificationCode}</Text>
                                <Text style={validityText}>
                                    (This code is valid for 10 minutes)
                                </Text>
                            </Section>
                        </Section>
                        <Hr />
                        <Section style={lowerSection}>
                            <Text style={cautionText}>
                                EnvXSync Developer or your instance admin will never email you and ask you to disclose
                                or verify your password, credit card, or banking account number.
                            </Text>
                        </Section>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}

EnvXSyncResetPassword.PreviewProps = {
    verificationCode: 'REPLACE_CODE',
} satisfies EnvXSyncResetPasswordProps;

const main = {
    backgroundColor: '#fff',
    color: '#212121',
};

const container = {
    padding: '20px',
    margin: '0 auto',
    backgroundColor: '#eee',
};

const h1 = {
    color: '#333',
    fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '15px',
};

const link = {
    color: '#2754C5',
    fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    fontSize: '14px',
    textDecoration: 'underline',
};

const text = {
    color: '#333',
    fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    fontSize: '14px',
    margin: '24px 0',
};

const imageSection = {
    backgroundColor: '#252f3d',
    display: 'flex',
    padding: '20px 0',
    alignItems: 'center',
    justifyContent: 'center',
};

const coverSection = { backgroundColor: '#fff' };

const upperSection = { padding: '25px 35px' };

const lowerSection = { padding: '25px 35px' };

const footerText = {
    ...text,
    fontSize: '12px',
    padding: '0 20px',
};

const verifyText = {
    ...text,
    margin: 0,
    fontWeight: 'bold',
    textAlign: 'center' as const,
};

const codeText = {
    ...text,
    fontWeight: 'bold',
    fontSize: '36px',
    margin: '10px 0',
    textAlign: 'center' as const,
};

const validityText = {
    ...text,
    margin: '0px',
    textAlign: 'center' as const,
};

const verificationSection = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

const mainText = { ...text, marginBottom: '14px' };

const cautionText = { ...text, margin: '0px' };
