
import React from 'react';
import { useLocation } from 'react-router-dom';
import { externalLinks } from '../services/externalLinks';
import Spinner from '../components/Spinner';

const ExternalPage: React.FC = () => {
    const location = useLocation();
    const [loading, setLoading] = React.useState(true);
    const currentLink = externalLinks.find(link => `/${link.path}` === location.pathname);

    if (!currentLink) {
        return <div className="flex items-center justify-center h-screen bg-dark-bg text-white text-xl">Error: Invalid external link path.</div>;
    }

    return (
        <div className="w-full h-screen bg-dark-bg relative">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center z-0">
                    <Spinner size="12" />
                </div>
            )}
            <iframe
                src={currentLink.url}
                title={currentLink.name}
                className="w-full h-full border-0 relative z-10 bg-white"
                onLoad={() => setLoading(false)}
                allowFullScreen
            />
        </div>
    );
};

export default ExternalPage;
