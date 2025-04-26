import styled from '@emotion/styled';

const FooterContainer = styled.div`
  text-align: center;
  padding: 20px 0;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  margin-top: 40px;
`;

const FooterRow = styled.div`
  margin-bottom: 5px;
`;

const FooterLink = styled.a`
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: color 0.2s ease;
  
  &:hover {
    color: white;
  }
`;

interface FooterProps {
  appName?: string;
  year?: number;
}

const Footer: React.FC<FooterProps> = ({ 
  appName = "VectorDB Interface", 
  year = new Date().getFullYear() 
}) => {
  return (
    <FooterContainer>
      <FooterRow>{appName} | Powered by Syntera Marketplace API</FooterRow>
      <FooterRow>
        © {year} | <FooterLink href="#">Documentation</FooterLink> | <FooterLink href="#">Terms of Service</FooterLink>
      </FooterRow>
    </FooterContainer>
  );
};

export default Footer;