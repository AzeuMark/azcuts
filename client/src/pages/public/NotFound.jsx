import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import Button from '../../components/ui/Button';
import './NotFound.css';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="notfound-page">
      <FileQuestion size={64} strokeWidth={1} />
      <h1>404</h1>
      <p>Page not found</p>
      <Button onClick={() => navigate('/')}>Go Home</Button>
    </div>
  );
}
