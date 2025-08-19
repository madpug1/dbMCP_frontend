import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Define the main App component
const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [mcpSubPage, setMcpSubPage] = useState('landing');
  const [sftpDetails, setSftpDetails] = useState({ host: '', username: '', password: '', port: '' });
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    try {
      const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
      const app = initializeApp(firebaseConfig);
      const firestoreDb = getFirestore(app);
      const firebaseAuth = getAuth(app);
      setDb(firestoreDb);
      setAuth(firebaseAuth);

      const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
        if (user) {
          setUserId(user.uid);
        } else {
          const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
          try {
            if (initialAuthToken) {
              await signInWithCustomToken(firebaseAuth, initialAuthToken);
            } else {
              await signInAnonymously(firebaseAuth);
            }
          } catch (error) {
            console.error("Firebase authentication error:", error);
            setUserId(crypto.randomUUID());
          }
        }
        setIsAuthReady(true);
      });
      return () => unsubscribe();
    } catch (error) {
      console.error("Failed to initialize Firebase:", error);
      setIsAuthReady(true);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowToolsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const navigateTo = (page) => {
    setCurrentPage(page);
    if (page === 'mcp') {
      setMcpSubPage('landing');
    }
    setShowToolsDropdown(false);
  };
  
  const navigateToMcpSubPage = (subPage) => {
    setMcpSubPage(subPage);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage navigateTo={navigateTo} />;
      case 'mcp':
        switch (mcpSubPage) {
          case 'landing':
            return <MCPLandingPage navigateToMcpSubPage={navigateToMcpSubPage} />;
          case 'configure':
            return <MCPPage navigateToMcpSubPage={navigateToMcpSubPage} sftpDetails={sftpDetails} setSftpDetails={setSftpDetails} />;
          case 'chat':
            return <ChatPage sftpDetails={sftpDetails} setSftpDetails={setSftpDetails} navigateToMcpSubPage={navigateToMcpSubPage} />;
          default:
            return <MCPLandingPage navigateToMcpSubPage={navigateToMcpSubPage} />;
        }
      default:
        return <HomePage navigateTo={navigateTo} />;
    }
  };

  return (
    // Ensure the root div takes full screen height and is a flex container
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex flex-col w-full items-center font-inter">
      <header className="w-full px-4 py-6 bg-white shadow-2xl rounded-b-2xl mb-4 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 relative z-10">
        <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight text-center sm:text-left">
          🌌 Gateway
        </h1>
        <nav className="relative" ref={dropdownRef}>
          <button onClick={() => setShowToolsDropdown(!showToolsDropdown)} className="flex items-center px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-lg hover:from-blue-700 hover:to-purple-800 transform transition-all duration-300 ease-in-out hover:scale-105">
            Tools
            <svg className={`ml-2 w-4 h-4 transition-transform duration-300 ${showToolsDropdown ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          {showToolsDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 animate-fade-in-down">
              <button onClick={() => navigateTo('home')} className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200">
                Home
              </button>
              <button onClick={() => navigateTo('mcp')} className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200">
                MCP (Model Context Protocol)
              </button>
              <div className="border-t border-gray-200 my-2"></div>
              <p className="px-4 py-2 text-sm text-gray-500">More coming soon!</p>
            </div>
          )}
        </nav>
      </header>
      {/* Main content area - now flex-grow to take remaining height */}
      <main className="w-full flex-grow flex items-center justify-center p-4">
        {renderPage()}
      </main>
      {isAuthReady && userId && (
        <footer className="mt-4 w-full px-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-t-lg shadow-inner">
          <p>Current User ID: <span className="font-mono bg-gray-100 p-1 rounded-md text-gray-700 select-all">{userId}</span></p>
          <p className="text-center mt-2 text-gray-500">This ID is for demonstration and future data persistence.</p>
        </footer>
      )}
    </div>
  );
};

// Home Page Component
const HomePage = ({ navigateTo }) => {
  return (
    <div className="text-center p-6 animate-fade-in">
      <h2 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-700 mb-6 drop-shadow-lg">
        Welcome to Your Gateway! 🚀
      </h2>
      <p className="text-xl text-gray-700 leading-relaxed mb-8 max-w-2xl mx-auto">
        Discover a suite of powerful tools designed to empower your projects.
        Start by exploring the Model Context Protocol (MCP) server creation.
      </p>
      <button onClick={() => navigateTo('mcp')} className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-bold py-4 px-10 rounded-full shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
        Explore MCP Now!
      </button>
    </div>
  );
};

// Intermediate page for MCP
const MCPLandingPage = ({ navigateToMcpSubPage }) => {
  return (
    <div className="text-center p-6 animate-fade-in">
      <h2 className="text-4xl font-extrabold text-gray-800 mb-8 drop-shadow-lg">
        Model Context Protocol
      </h2>
      <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-10">
        Choose an option to get started with your MCP server.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-6">
        <button onClick={() => navigateToMcpSubPage('configure')} className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-full shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
          Configure Your Server
        </button>
        <button onClick={() => navigateToMcpSubPage('chat')} className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-full shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
          Let's Chat!
        </button>
      </div>
    </div>
  );
};

// ChatPage Component - Now with Schema Loading UI and enhanced visuals
const ChatPage = ({ sftpDetails, setSftpDetails, navigateToMcpSubPage }) => {
  const [schemaName, setSchemaName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [loadedSchema, setLoadedSchema] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [userQuery, setUserQuery] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const handleSchemaNameChange = (e) => {
    setSchemaName(e.target.value);
    setMessage('');
  };
  const handleSftpChange = (field, value) => {
    setSftpDetails({ ...sftpDetails, [field]: value });
    setMessage('');
  };

  const handleLoadSchema = async () => {
    if (schemaName.trim() === '') {
      setMessage({ type: 'error', text: 'Please enter a Schema Name to load.' });
      return;
    }
    if (Object.values(sftpDetails).some(val => val.trim() === '')) {
      setMessage({ type: 'error', text: 'Please fill out all SFTP Connection Details to load the schema.' });
      return;
    }

    setLoading(true);
    setMessage({ type: 'info', text: 'Loading schema from SFTP...' });

    const requestBody = {
      schemaName: schemaName,
      sftp: sftpDetails,
    };

    try {
      const response = await fetch(`http://localhost:5000/api/get-schema`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to retrieve schema.');
      }

      const schema = await response.json();
      setLoadedSchema({ ...schema, schemaName: schemaName });
      setMessage({ type: 'success', text: `Schema for '${schemaName}' loaded successfully!` });
    } catch (error) {
      setLoadedSchema(null);
      console.error("Error loading schema:", error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };
  
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (userQuery.trim() === '') return;

    const newUserMessage = { sender: 'user', text: userQuery };
    setChatMessages(prevMessages => [...prevMessages, newUserMessage]);
    const queryToSend = userQuery;
    setUserQuery('');
    
    try {
      const botThinkingMessage = { sender: 'bot', text: 'Thinking...' };
      setChatMessages(prevMessages => [...prevMessages, botThinkingMessage]);
      
      const response = await fetch('http://localhost:5000/api/chat-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryToSend,
          schema: loadedSchema,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get a response from the backend.');
      }

      const result = await response.json();
      
      setChatMessages(prevMessages => {
        const newMessages = prevMessages.slice(0, -1);
        let botResponseContent;

        if (result.response && Array.isArray(result.response) && result.response.length > 0 && typeof result.response[0] === 'object') {
            botResponseContent = { type: 'table', data: result.response };
        } else if (result.response && typeof result.response === 'string') {
            botResponseContent = { type: 'text', content: result.response };
        } else if (result.message && typeof result.message === 'string') {
            botResponseContent = { type: 'text', content: `Error: ${result.message}` };
        } else {
            botResponseContent = { type: 'text', content: 'An unknown error occurred or no valid response received.' };
        }
        
        return [...newMessages, { sender: 'bot', ...botResponseContent }];
      });
      
    } catch (error) {
      console.error("Error sending query to backend:", error);
      setChatMessages(prevMessages => {
        const newMessages = prevMessages.slice(0, -1);
        return [...newMessages, { sender: 'bot', type: 'text', content: `Error: ${error.message}` }];
      });
    }
  };

  const renderChatPanel = () => {
    return (
      // Main chat panel container, now full-width and takes up more vertical space
      // Removed max-w-xl to allow it to stretch, added h-full to fill parent
      <div className="flex flex-col flex-grow w-full h-full p-4 bg-white shadow-2xl rounded-2xl animate-fade-in">
        <div className="text-center mb-6">
          <h3 className="text-3xl font-bold text-gray-800">Chat with <span className="text-blue-600">{loadedSchema.schemaName || 'Your Data'}</span></h3>
          <p className="text-gray-500 text-sm">Your schema has been loaded. You can now chat with your data source.</p>
        </div>
        
        {/* Chat messages display area - flex-grow to fill space, custom scrollbar */}
        {/* Added min-h-[calc(100vh-250px)] to ensure a static minimum height for the chat history area */}
        <div className="flex-grow overflow-y-auto p-4 mb-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 shadow-inner custom-scrollbar min-h-[calc(100vh-350px)]">
          {chatMessages.map((msg, index) => (
            <div key={index} className={`flex mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-lg shadow-md ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'} ${msg.type === 'table' ? 'max-w-full sm:max-w-3xl' : 'max-w-[80%]'}`}>
                {msg.type === 'table' && msg.data && msg.data.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          {Object.keys(msg.data[0]).map(key => (
                            <th key={key} className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {msg.data.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {Object.values(row).map((value, colIndex) => (
                              <td key={colIndex} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {value !== null && value !== undefined ? String(value) : ''}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : msg.type === 'table' && msg.data && msg.data.length === 0 ? (
                  <p className="text-gray-600">No results found for your query.</p>
                ) : (
                  msg.content || msg.text
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat input form */}
        <form onSubmit={handleChatSubmit} className="flex p-2 bg-white rounded-lg shadow-inner border border-gray-200">
          <input 
            type="text" 
            placeholder="Type your query here..." 
            value={userQuery} 
            onChange={(e) => setUserQuery(e.target.value)} 
            className="flex-grow border-none rounded-l-md p-3 focus:outline-none focus:ring-0 text-lg" 
          />
          <button 
            type="submit" 
            className="bg-blue-600 text-white font-semibold rounded-r-md px-6 py-3 hover:bg-blue-700 transition-colors shadow-md"
          >
            Send
          </button>
        </form>
      </div>
    );
  };

  const renderSchemaLoadForm = () => {
    return (
      <div className="w-full max-w-xl p-6 animate-fade-in">
        <h2 className="text-4xl font-extrabold text-gray-800 text-center mb-8">Load Schema</h2>
        {message && (<div className={`p-4 mb-6 rounded-lg text-white font-medium text-center ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>{message.text}</div>)}
        {loading && (
          <div className="flex justify-center items-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="ml-3 text-gray-700">Loading...</p>
          </div>
        )}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-gray-200">
          <label htmlFor="schemaName" className="block text-xl font-bold text-gray-800 mb-2">Schema Name</label>
          <input type="text" id="schemaName" value={schemaName} onChange={handleSchemaNameChange} placeholder="e.g., MyNewSchema" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-lg p-3" />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">SFTP Connection Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Host" value={sftpDetails.host} onChange={(e) => setSftpDetails({ ...sftpDetails, host: e.target.value })} className="border rounded-md p-3 w-full" />
            <input type="text" placeholder="Username" value={sftpDetails.username} onChange={(e) => setSftpDetails({ ...sftpDetails, username: e.target.value })} className="border rounded-md p-3 w-full" />
            <input type="password" placeholder="Password" value={sftpDetails.password} onChange={(e) => setSftpDetails({ ...sftpDetails, password: e.target.value })} className="border rounded-md p-3 w-full" />
            <input type="number" placeholder="SFTP Port" value={sftpDetails.port} onChange={(e) => setSftpDetails({ ...sftpDetails, port: e.target.value })} className="border rounded-md p-3 w-full" />
          </div>
        </div>
        <div className="flex justify-center mt-6">
          <button onClick={handleLoadSchema} disabled={schemaName.trim() === '' || Object.values(sftpDetails).some(val => val.trim() === '') || loading} className={`px-6 py-3 font-semibold rounded-lg ${(schemaName.trim() !== '' && !loading) ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}>
            Load Schema
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center w-full">
      {loadedSchema ? renderChatPanel() : renderSchemaLoadForm()}
    </div>
  );
};


// MCP Page Component - Simplified Schema Fields
const MCPPage = ({ navigateToMcpSubPage, sftpDetails, setSftpDetails }) => {
  const [fields, setFields] = useState([]);
  const nextId = useRef(0);
  const [schemaName, setSchemaName] = useState('');
  const [message, setMessage] = useState('');
  const nextTrainingId = useRef(0);
  const [trainingSets, setTrainingSets] = useState([]);
  const [llmEndpoint, setLlmEndpoint] = useState({
    url: '', authType: 'None', credentials: { authHeader: '', clientId: '', clientSecret: '' },
    body: { sampleJson: '', queryKey: '', responseKey: '' }, extraHeaders: [], extraQueryParams: []
  });
  const nextHeaderId = useRef(0);
  const nextQueryParamId = useRef(0);
  const [dbCredentials, setDbCredentials] = useState({
    host: '', port: '', user: '', password: '', database: ''
  });
  const [retrievedSchema, setRetrievedSchema] = useState(null);
  
  const [showChatButton, setShowChatButton] = useState(false);

  const handleSftpChange = (field, value) => { setSftpDetails({ ...sftpDetails, [field]: value }); setMessage(''); setShowChatButton(false); };
  const handleSchemaNameChange = (value) => { setSchemaName(value); setMessage(''); setShowChatButton(false); };
  const handleFieldChange = (id, value) => {
    setFields(fields.map(field => field.id === id ? { ...field, name: value } : field));
    setMessage('');
    setShowChatButton(false);
  };
  const handleAddField = () => { setFields([...fields, { id: nextId.current++, name: '' }]); setMessage(''); setShowChatButton(false); };
  const handleRemoveField = (id) => { setFields(fields.filter(field => field.id !== id)); setMessage(''); setShowChatButton(false); };
  const handleAddTrainingSet = () => { setTrainingSets([...trainingSets, { id: nextTrainingId.current++, input: '', output: '' }]); setMessage(''); setShowChatButton(false); };
  const handleTrainingSetChange = (id, fieldName, value) => { setTrainingSets(trainingSets.map(set => set.id === id ? { ...set, [fieldName]: value } : set)); setMessage(''); setShowChatButton(false); };
  const handleRemoveTrainingSet = (id) => { setTrainingSets(trainingSets.filter(set => set.id !== id)); setMessage(''); setShowChatButton(false); };
  const handleLlmEndpointChange = (e) => { setLlmEndpoint({ ...llmEndpoint, url: e.target.value }); setMessage(''); setShowChatButton(false); };
  const handleLlmAuthTypeChange = (e) => { setLlmEndpoint({ ...llmEndpoint, authType: e.target.value, credentials: { authHeader: '', clientId: '', clientSecret: '' } }); setMessage(''); setShowChatButton(false); };
  const handleLlmCredentialsChange = (field, value) => { setLlmEndpoint({ ...llmEndpoint, credentials: { ...llmEndpoint.credentials, [field]: value } }); setMessage(''); setShowChatButton(false); };
  const handleAddHeader = () => { setLlmEndpoint({ ...llmEndpoint, extraHeaders: [...llmEndpoint.extraHeaders, { id: nextHeaderId.current++, key: '', value: '' }] }); setMessage(''); setShowChatButton(false); };
  const handleHeaderChange = (id, fieldName, value) => { setLlmEndpoint({ ...llmEndpoint, extraHeaders: llmEndpoint.extraHeaders.map(header => header.id === id ? { ...header, [fieldName]: value } : header) }); setMessage(''); setShowChatButton(false); };
  const handleRemoveHeader = (id) => { setLlmEndpoint({ ...llmEndpoint, extraHeaders: llmEndpoint.extraHeaders.filter(header => header.id !== id) }); setMessage(''); setShowChatButton(false); };
  const handleAddQueryParam = () => { setLlmEndpoint({ ...llmEndpoint, extraQueryParams: [...llmEndpoint.extraQueryParams, { id: nextQueryParamId.current++, key: '', value: '' }] }); setMessage(''); setShowChatButton(false); };
  const handleQueryParamChange = (id, fieldName, value) => { setLlmEndpoint({ ...llmEndpoint, extraQueryParams: llmEndpoint.extraQueryParams.map(param => param.id === id ? { ...param, [fieldName]: value } : param) }); setMessage(''); setShowChatButton(false); };
  const handleRemoveQueryParam = (id) => { setLlmEndpoint({ ...llmEndpoint, extraQueryParams: llmEndpoint.extraQueryParams.filter(param => param.id !== id) }); setMessage(''); setShowChatButton(false); };
  const handleDbCredentialChange = (field, value) => { setDbCredentials({ ...dbCredentials, [field]: value }); setMessage(''); setShowChatButton(false); };
  const handleLlmBodyChange = (value) => { setLlmEndpoint({ ...llmEndpoint, body: { ...llmEndpoint.body, sampleJson: value } }); setMessage(''); setShowChatButton(false); };
  const handleLlmQueryKeyChange = (value) => { setLlmEndpoint({ ...llmEndpoint, body: { ...llmEndpoint.body, queryKey: value } }); setMessage(''); setShowChatButton(false); };
  const handleLlmResponseKeyChange = (value) => { setLlmEndpoint({ ...llmEndpoint, body: { ...llmEndpoint.body, responseKey: value } }); setMessage(''); setShowChatButton(false); };

  const handleSubmitSchema = async () => {
    if (schemaName.trim() === '') { setMessage({ type: 'error', text: 'Please enter a Schema Name.' }); return; }
    const filledNames = fields.map(field => field.name.trim()).filter(name => name !== '');
    if (filledNames.length !== fields.length) { setMessage({ type: 'error', text: 'All schema field names must be filled out.' }); return; }
    const uniqueNames = new Set(filledNames);
    if (uniqueNames.size !== fields.length) { setMessage({ type: 'error', text: 'Schema field names must be unique.' }); return; }
    const filledTrainingSets = trainingSets.every(set => set.input.trim() !== '' && set.output.trim() !== '');
    if (trainingSets.length > 0 && !filledTrainingSets) { setMessage({ type: 'error', text: 'All training set input and output fields must be filled.' }); return; }
    if (llmEndpoint.url.trim() !== '') {
      if (llmEndpoint.authType === 'Authorization Header' && llmEndpoint.credentials.authHeader.trim() === '') { setMessage({ type: 'error', text: 'Authorization Header value is required.' }); return; }
      if (llmEndpoint.authType === 'Client ID/Secret' && (llmEndpoint.credentials.clientId.trim() === '' || llmEndpoint.credentials.clientSecret.trim() === '')) { setMessage({ type: 'error', text: 'Client ID and Secret are required.' }); return; }
      if (llmEndpoint.extraHeaders.some(h => h.key.trim() === '' || h.value.trim() === '')) { setMessage({ type: 'error', text: 'All extra headers must have a key and a value.' }); return; }
      if (llmEndpoint.extraQueryParams.some(q => q.key.trim() === '' || q.value.trim() === '')) { setMessage({ type: 'error', text: 'All extra query parameters must have a key and a value.' }); return; }
    }
    const isDbFilled = Object.values(dbCredentials).some(val => val.trim() !== '');
    if (isDbFilled) {
      const areAllDbFieldsFilled = Object.values(dbCredentials).every(val => val.trim() !== '');
      if (!areAllDbFieldsFilled) { setMessage({ type: 'error', text: 'Please fill all Database Connection fields or leave them all empty.' }); return; }
    }
    if (llmEndpoint.body.sampleJson.trim() !== '') {
      if (llmEndpoint.body.queryKey.trim() === '') { setMessage({ type: 'error', text: 'Please specify the Query Key for the LLM Body.' }); return; }
      if (llmEndpoint.body.responseKey.trim() === '') { setMessage({ type: 'error', text: 'Please specify the Response Key for the LLM Body.' }); return; }
    }

    const fieldsInTable = fields.map(field => field.name.trim()).join(',');
    const schema = {
      sftp: sftpDetails, name: schemaName.trim(), 
      "Fields in database table": fieldsInTable,
      trainingSets: trainingSets.map(({ id, ...rest }) => rest),
      llmEndpoint: llmEndpoint.url.trim() ? {
        ...llmEndpoint, extraHeaders: llmEndpoint.extraHeaders.map(({ id, ...rest }) => rest),
        extraQueryParams: llmEndpoint.extraQueryParams.map(({ id, ...rest }) => rest),
      } : null,
      dbCredentials: isDbFilled ? dbCredentials : null,
    };
    
    setMessage({ type: 'info', text: 'Submitting schema to backend...' });
    try {
      const response = await fetch('http://localhost:5000/api/save-schema', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(schema),
      });
      const result = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: result.message || 'Schema submitted successfully!' });
        setShowChatButton(true);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to submit schema. ' + (result.message || '') });
        setShowChatButton(false);
      }
    } catch (error) {
      console.error("Error sending schema to backend:", error);
      setMessage({ type: 'error', text: 'Network error or backend is not reachable. Ensure the Python backend is running.' });
      setShowChatButton(false);
    }
  };
  const handleRetrieveSchema = async () => {
    if (!schemaName) { setMessage({ type: 'error', text: 'Please enter a Schema Name to retrieve.' }); return; }
    if (Object.values(sftpDetails).some(val => val.trim() === '')) {
      setMessage({ type: 'error', text: 'Please fill out all SFTP Connection Details to retrieve the schema.' });
      return;
    }

    setRetrievedSchema(null);
    const requestBody = { schemaName: schemaName, sftp: sftpDetails };
    try {
      setMessage({ type: 'info', text: 'Retrieving schema from SFTP via backend...' });
      const response = await fetch(`http://localhost:5000/api/get-schema`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to retrieve schema.');
      }
      const schema = await response.json();
      
      if (schema["Fields in database table"]) {
          const fieldsArray = schema["Fields in database table"].split(',').map((name, index) => ({ id: index, name: name.trim() }));
          setFields(fieldsArray);
          nextId.current = fieldsArray.length;
      }
      
      if (schema.trainingSets) setTrainingSets(schema.trainingSets.map((ts, i) => ({ ...ts, id: i + nextTrainingId.current })));
      if (schema.llmEndpoint) {
        setLlmEndpoint({
          ...schema.llmEndpoint,
          extraHeaders: schema.llmEndpoint.extraHeaders ? schema.llmEndpoint.extraHeaders.map((h, i) => ({ ...h, id: i + nextHeaderId.current })) : [],
          extraQueryParams: schema.llmEndpoint.extraQueryParams ? schema.llmEndpoint.extraQueryParams.map((q, i) => ({ ...q, id: i + nextQueryParamId.current })) : [],
        });
      }
      if (schema.dbCredentials) setDbCredentials(schema.dbCredentials);

      setRetrievedSchema(schema);
      setMessage({ type: 'success', text: `Schema for '${schemaName}' retrieved successfully!` });
      console.log('Retrieved Schema:', schema);
      setShowChatButton(true);
    } catch (error) {
      console.error("Error retrieving schema:", error);
      setMessage({ type: 'error', text: error.message });
      setShowChatButton(false);
    }
  };

  return (
    <div className="w-full p-6 animate-fade-in">
      <h2 className="text-4xl font-extrabold text-blue-700 text-center mb-8 drop-shadow-md">
        Define Your MCP Schema 📊
      </h2>
      {message && (<div className={`p-4 mb-6 rounded-lg text-white font-medium text-center ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>{message.text}</div>)}
      <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">SFTP Connection Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Host" value={sftpDetails.host} onChange={(e) => setSftpDetails({ ...sftpDetails, host: e.target.value })} className="border rounded-md p-3 w-full" />
          <input type="text" placeholder="Username" value={sftpDetails.username} onChange={(e) => setSftpDetails({ ...sftpDetails, username: e.target.value })} className="border rounded-md p-3 w-full" />
          <input type="password" placeholder="Password" value={sftpDetails.password} onChange={(e) => setSftpDetails({ ...sftpDetails, password: e.target.value })} className="border rounded-md p-3 w-full" />
          <input type="number" placeholder="SFTP Port" value={sftpDetails.port} onChange={(e) => setSftpDetails({ ...sftpDetails, port: e.target.value })} className="border rounded-md p-3 w-full" />
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-gray-200">
        <label htmlFor="schemaName" className="block text-xl font-bold text-gray-800 mb-2">Schema Name</label>
        <input type="text" id="schemaName" value={schemaName} onChange={(e) => handleSchemaNameChange(e.target.value)} placeholder="e.g., UserProfile, ProductCatalog" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-lg p-3" />
      </div>
      
      <div className="bg-gray-50 p-6 rounded-xl shadow-inner mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Schema Fields</h3>
        {fields.length === 0 && (<p className="text-gray-500 text-center py-4">Click "Add New Field" to start defining your schema.</p>)}
        {fields.map(field => (
          <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-200">
            <div className="md:col-span-2">
              <input type="text" value={field.name} onChange={(e) => handleFieldChange(field.id, e.target.value)} placeholder="Field Name" className="border rounded-md p-2 w-full" />
            </div>
            <div className="flex justify-center">
              <button onClick={() => handleRemoveField(field.id)} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">Remove</button>
            </div>
          </div>
        ))}
        <button onClick={handleAddField} className="mt-4 px-6 py-3 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-600">Add New Field</button>
      </div>

      <div className="bg-gray-50 p-6 rounded-xl shadow-inner mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Training Sets</h3>
        {trainingSets.length === 0 && (<p className="text-gray-500 text-center py-4">Add input/output pairs for model training.</p>)}
        {trainingSets.map(set => (
          <div key={set.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-200">
            <input type="text" placeholder="Input" value={set.input} onChange={(e) => handleTrainingSetChange(set.id, 'input', e.target.value)} className="border rounded-md p-2 w-full" />
            <input type="text" placeholder="Output" value={set.output} onChange={(e) => handleTrainingSetChange(set.id, 'output', e.target.value)} className="border rounded-md p-2 w-full" />
            <div className="flex justify-center">
              <button onClick={() => handleRemoveTrainingSet(set.id)} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">Remove</button>
            </div>
          </div>
        ))}
        <button onClick={handleAddTrainingSet} className="mt-4 px-6 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600">Add New Training Set</button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">LLM Endpoint</h3>
        <input type="text" placeholder="LLM Endpoint URL" value={llmEndpoint.url} onChange={handleLlmEndpointChange} className="border rounded-md p-3 w-full mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <select value={llmEndpoint.authType} onChange={handleLlmAuthTypeChange} className="border rounded-md p-3 w-full">
            <option value="None">No Authentication</option>
            <option value="Authorization Header">Authorization Header</option>
            <option value="Client ID/Secret">Client ID / Client Secret</option>
          </select>
          {llmEndpoint.authType === 'Authorization Header' && (
            <input type="text" placeholder="Header Value (e.g., Bearer token)" value={llmEndpoint.credentials.authHeader} onChange={(e) => handleLlmCredentialsChange('authHeader', e.target.value)} className="border rounded-md p-3 w-full" />
          )}
          {llmEndpoint.authType === 'Client ID/Secret' && (
            <>
              <input type="text" placeholder="Client ID" value={llmEndpoint.credentials.clientId} onChange={(e) => handleLlmCredentialsChange('clientId', e.target.value)} className="border rounded-md p-3 w-full" />
              <input type="password" placeholder="Client Secret" value={llmEndpoint.credentials.clientSecret} onChange={(e) => handleLlmCredentialsChange('clientSecret', e.target.value)} className="border rounded-md p-3 w-full" />
            </>
          )}
        </div>
        <div className="mt-6">
          <h4 className="text-lg font-bold text-gray-800 mb-2">Request Body (optional)</h4>
          <p className="text-gray-500 text-sm mb-2">Paste a sample JSON body. Use a special key (e.g., `_query_`) to mark where the user query should be inserted.</p>
          <textarea 
            rows="6" 
            placeholder='e.g., {"messages": [{"role": "user", "content": "_query_"}]}' 
            value={llmEndpoint.body.sampleJson} 
            onChange={(e) => handleLlmBodyChange(e.target.value)}
            className="border rounded-md p-3 w-full mb-2"
          ></textarea>
          <input type="text" placeholder="Query Key (e.g., messages.0.content)" value={llmEndpoint.body.queryKey} onChange={(e) => handleLlmQueryKeyChange(e.target.value)} className="border rounded-md p-3 w-full text-sm" />
          <input type="text" placeholder="Response Key (e.g., choices.0.message.content)" value={llmEndpoint.body.responseKey} onChange={(e) => handleLlmResponseKeyChange(e.target.value)} className="border rounded-md p-3 w-full text-sm mt-2" />
        </div>
        <div className="mt-6">
          <h4 className="text-lg font-bold text-gray-800 mb-2">Extra Headers</h4>
          {llmEndpoint.extraHeaders.length === 0 && (<p className="text-gray-500 text-sm text-center py-2">Add custom headers for the endpoint.</p>)}
          {llmEndpoint.extraHeaders.map(header => (
            <div key={header.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-gray-50 p-3 rounded-lg shadow-sm mb-2">
              <input type="text" placeholder="Key" value={header.key} onChange={(e) => handleHeaderChange(header.id, 'key', e.target.value)} className="border rounded-md p-2 w-full" />
              <input type="text" placeholder="Value" value={header.value} onChange={(e) => handleHeaderChange(header.id, 'value', e.target.value)} className="border rounded-md p-2 w-full" />
              <div className="flex justify-center">
                <button onClick={() => handleRemoveHeader(header.id)} className="px-4 py-2 bg-red-500 text-white rounded-md text-sm hover:bg-red-600">Remove</button>
              </div>
            </div>
          ))}
          <button onClick={handleAddHeader} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">Add Header</button>
        </div>
        <div className="mt-6">
          <h4 className="text-lg font-bold text-gray-800 mb-2">Extra Query Parameters</h4>
          {llmEndpoint.extraQueryParams.length === 0 && (<p className="text-gray-500 text-sm text-center py-2">Add custom query parameters to the URL.</p>)}
          {llmEndpoint.extraQueryParams.map(param => (
            <div key={param.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-gray-50 p-3 rounded-lg shadow-sm mb-2">
              <input type="text" placeholder="Key" value={param.key} onChange={(e) => handleQueryParamChange(param.id, 'key', e.target.value)} className="border rounded-md p-2 w-full" />
              <input type="text" placeholder="Value" value={param.value} onChange={(e) => handleQueryParamChange(param.id, 'value', e.target.value)} className="border rounded-md p-2 w-full" />
              <div className="flex justify-center">
                <button onClick={() => handleRemoveQueryParam(param.id)} className="px-4 py-2 bg-red-500 text-white rounded-md text-sm hover:bg-red-600">Remove</button>
              </div>
            </div>
          ))}
          <button onClick={handleAddQueryParam} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">Add Parameter</button>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Database Connection</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Host" value={dbCredentials.host} onChange={(e) => handleDbCredentialChange('host', e.target.value)} className="border rounded-md p-3 w-full" />
          <input type="number" placeholder="Port" value={dbCredentials.port} onChange={(e) => handleDbCredentialChange('port', e.target.value)} className="border rounded-md p-3 w-full" />
          <input type="text" placeholder="User" value={dbCredentials.user} onChange={(e) => handleDbCredentialChange('user', e.target.value)} className="border rounded-md p-3 w-full" />
          <input type="password" placeholder="Password" value={dbCredentials.password} onChange={(e) => handleDbCredentialChange('password', e.target.value)} className="border rounded-md p-3 w-full" />
          <input type="text" placeholder="Database" value={dbCredentials.database} onChange={(e) => handleDbCredentialChange('database', e.target.value)} className="border rounded-md p-3 w-full" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button onClick={handleSubmitSchema} disabled={schemaName.trim() === '' || fields.length === 0} className={`px-6 py-3 font-semibold rounded-lg ${(schemaName.trim() !== '' && fields.length > 0) ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}>Submit Schema</button>
        <button onClick={handleRetrieveSchema} disabled={schemaName.trim() === ''} className={`px-6 py-3 font-semibold rounded-lg ${schemaName.trim() !== '' ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}>Retrieve Schema</button>
      </div>
      {message && (
        <div className={`p-4 mt-6 rounded-lg text-white font-medium text-center ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {message.text}
        </div>
      )}
      {retrievedSchema && (
        <div className="mt-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Retrieved Schema:</h3>
          <pre className="mt-4 p-6 bg-gray-50 border rounded-xl shadow-inner text-sm overflow-x-auto text-gray-800">{JSON.stringify(retrievedSchema, null, 2)}</pre>
        </div>
      )}
      
      {showChatButton && (
        <div className="mt-6 flex justify-center">
            <button
                onClick={() => navigateToMcpSubPage('chat')}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-full shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl"
            >
                Let's Chat! 💬
            </button>
        </div>
      )}
    </div>
  );
};


// Export the main App component as default
export default App;
