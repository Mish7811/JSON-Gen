import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Download, Eye, EyeOff, Music } from 'lucide-react';

interface Song {
  id: number;
  main: string;
  eng: string;
}

interface WeekData {
  week_number: number;
  week_suffix: string;
  BN_offering: string;
  MN_offering: string;
  PN_offering: string;
  BN_SundayS: string;
  MN_SundayS: string;
}

function App() {
  const [weekData, setWeekData] = useState<WeekData>({
    week_number: 1,
    week_suffix: 'st',
    BN_offering: '',
    MN_offering: '',
    PN_offering: '',
    BN_SundayS: '',
    MN_SundayS: ''
  });

  const [songs, setSongs] = useState<Song[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [nextSongId, setNextSongId] = useState(1);
  const scriptUrl = import.meta.env.VITE_SCRIPT_URL;

  // ✅ Fetch songs from Apps Script Web App on load
  useEffect(() => {
    fetch(scriptUrl)
      .then(res => res.json())
      .then((data: any[]) => {
        const songsFromSheet: Song[] = data.map((row, idx) => ({
          id: idx + 1,
          main: row.lyrics || '',
          eng: row.english || ''
        }));
        setSongs(songsFromSheet);
        setNextSongId(songsFromSheet.length + 1);
      })
      .catch(err => console.error("❌ Error fetching songs:", err));
  }, []);

  // useEffect(() => {
  //   const backendUrl = process.env.REACT_APP_BACKEND_URL; // safely from env
  //   if (!backendUrl) return;
    
  //   fetch(`${backendUrl}/api/fetch-songs`)
  //     .then(res => res.json())
  //     .then((data: any[]) => {
  //       const songsFromSheet: Song[] = data.map((row, idx) => ({
  //         id: idx + 1,
  //         main: row.lyrics || '',
  //         eng: row.english || ''
  //       }));
  //       setSongs(songsFromSheet);
  //       setNextSongId(songsFromSheet.length + 1);
  //     })
  //     .catch(err => console.error("❌ Error fetching songs:", err));
  // }, []);

  const handleWeekDataChange = (field: keyof WeekData, value: string | number) => {
    setWeekData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSongChange = (id: number, field: 'main' | 'eng', value: string) => {
    setSongs(prev => prev.map(song => 
      song.id === id ? { ...song, [field]: value } : song
    ));
  };

  const addSong = () => {
    setSongs(prev => [...prev, { id: nextSongId, main: '', eng: '' }]);
    setNextSongId(prev => prev + 1);
  };

  const removeSong = (id: number) => {
    if (songs.length > 1) {
      setSongs(prev => prev.filter(song => song.id !== id));
    }
  };

  const generateJSON = () => {
    const songsObject: { [key: string]: { main: string; eng: string } } = {};
    
    songs.forEach((song, index) => {
      const songNumber = index + 1;
      songsObject[`song_${songNumber}`] = {
        main: song.main,
        eng: song.eng
      };
    });

    return {
      week_number: weekData.week_number,
      week_suffix: weekData.week_suffix,
      BN_offering: weekData.BN_offering ? `${weekData.BN_offering} & Family` : '',
      MN_offering: weekData.MN_offering ? `${weekData.MN_offering} & Family` : '',
      PN_offering: weekData.PN_offering ? `${weekData.PN_offering} & Family` : '',
      BN_SundayS: weekData.BN_SundayS,
      MN_SundayS: weekData.MN_SundayS,
      songs: songsObject
    };
  };

  const downloadJSON = () => {
    const jsonData = generateJSON();
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `week_${weekData.week_number}_songs.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getSuffixOptions = () => ['st', 'nd', 'rd', 'th'];

  const updateGSlides = async () => {
  try {
    const response = await fetch(import.meta.env.VITE_PY_BACKEND_URL + '/update-slides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(generateJSON()),
    });

    if (!response.ok) throw new Error('Failed to update Google Slides');

    const data = await response.json();
    alert(`✅ Google Slides updated: ${data.message}`);
  } catch (err: any) {
    console.error(err);
    alert(`❌ Error updating Google Slides: ${err.message}`);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-900 to-red-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Music className="w-8 h-8 text-amber-400" />
            <h1 className="text-4xl font-bold text-white">Church Songs Generator</h1>
          </div>
          <p className="text-lg text-gray-300">Generate JSON files for Google Slides automation</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="space-y-6">
            {/* Week Information */}
            <div className="bg-gray-800/60 backdrop-blur-sm border border-amber-700/30 rounded-xl shadow-2xl shadow-amber-900/20 p-6">
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                📅 Week Information
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Week Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={weekData.week_number}
                    onChange={(e) => handleWeekDataChange('week_number', parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 bg-gray-700/60 border border-amber-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                    placeholder="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Week Suffix
                  </label>
                  <select
                    value={weekData.week_suffix}
                    onChange={(e) => handleWeekDataChange('week_suffix', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/60 border border-amber-600/50 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                  >
                    {getSuffixOptions().map(suffix => (
                      <option key={suffix} value={suffix}>{suffix}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Offerings */}
            <div className="bg-gray-800/60 backdrop-blur-sm border border-amber-700/30 rounded-xl shadow-2xl shadow-amber-900/20 p-6">
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                🎁 Offerings Time Song Families
              </h2>
              <p className="text-sm text-amber-300 mb-4 bg-amber-900/20 border border-amber-700/30 rounded-lg p-3">
                💡 Note: " & Family" will be automatically added to each offering name in the JSON output
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    BN Offering (Name only)
                  </label>
                  <input
                    type="text"
                    value={weekData.BN_offering}
                    onChange={(e) => handleWeekDataChange('BN_offering', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/60 border border-amber-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                    placeholder="John"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    MN Offering (Name only)
                  </label>
                  <input
                    type="text"
                    value={weekData.MN_offering}
                    onChange={(e) => handleWeekDataChange('MN_offering', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/60 border border-amber-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                    placeholder="Doe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    PN Offering (Name only)
                  </label>
                  <input
                    type="text"
                    value={weekData.PN_offering}
                    onChange={(e) => handleWeekDataChange('PN_offering', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/60 border border-amber-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                    placeholder="Roger"
                  />
                </div>
              </div>
            </div>

            {/* Sunday Services */}
            <div className="bg-gray-800/60 backdrop-blur-sm border border-amber-700/30 rounded-xl shadow-2xl shadow-amber-900/20 p-6">
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                ⛪ Sunday Services
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    BN SundayS
                  </label>
                  <input
                    type="text"
                    value={weekData.BN_SundayS}
                    onChange={(e) => handleWeekDataChange('BN_SundayS', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/60 border border-amber-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                    placeholder="Anu & Kev"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    MN SundayS
                  </label>
                  <input
                    type="text"
                    value={weekData.MN_SundayS}
                    onChange={(e) => handleWeekDataChange('MN_SundayS', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/60 border border-amber-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                    placeholder="Mish & Jon"
                  />
                </div>
              </div>
            </div>

            {/* Songs Section */}
            <div className="bg-gray-800/60 backdrop-blur-sm border border-amber-700/30 rounded-xl shadow-2xl shadow-amber-900/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                  🎵 Songs
                </h2>
                <button
                  onClick={addSong}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-red-700 text-white px-4 py-2 rounded-lg hover:from-amber-700 hover:to-red-800 shadow-lg hover:shadow-amber-500/25 transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  Add Song
                </button>
              </div>
              
              <div className="space-y-6">
                {songs.map((song, index) => (
                  <div key={song.id} className="border border-amber-600/30 bg-gray-700/40 rounded-lg p-4 relative">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-200">Song {index + 1}</h3>
                      {songs.length > 1 && (
                        <button
                          onClick={() => removeSong(song.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-1 rounded transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Main Lyrics (Tamil/Telugu)
                        </label>
                        <textarea
                          value={song.main}
                          onChange={(e) => handleSongChange(song.id, 'main', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-700/60 border border-amber-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 resize-vertical"
                          rows={4}
                          placeholder="Enter main lyrics..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          English Transcript
                        </label>
                        <textarea
                          value={song.eng}
                          onChange={(e) => handleSongChange(song.id, 'eng', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-700/60 border border-amber-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 resize-vertical"
                          rows={4}
                          placeholder="Enter English lyrics..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preview and Actions */}
          <div className="space-y-6">
            <div className="bg-gray-800/60 backdrop-blur-sm border border-amber-700/30 rounded-xl shadow-2xl shadow-amber-900/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">JSON Preview</h2>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors duration-200"
                >
                  {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showPreview ? 'Hide' : 'Show'} Preview
                </button>
              </div>
              
              {showPreview && (
                <div className="bg-gray-900/80 border border-amber-600/30 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-sm text-amber-300 whitespace-pre-wrap font-mono">
                    {JSON.stringify(generateJSON(), null, 2)}
                  </pre>
                </div>
              )}
              
              <div className="mt-6">
                <button
                  onClick={downloadJSON}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-amber-600 to-red-700 text-white px-6 py-4 rounded-lg hover:from-amber-700 hover:to-red-800 transition-all duration-200 text-lg font-medium shadow-lg hover:shadow-amber-500/25"
                >
                  <Download className="w-5 h-5" />
                  Download JSON File
                </button>
              </div>
              <div className="mt-4">
                <button
                  onClick={updateGSlides}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-blue-700 text-white px-6 py-4 rounded-lg hover:from-green-700 hover:to-blue-800 transition-all duration-200 text-lg font-medium shadow-lg hover:shadow-green-500/25"
                >
                  <Download className="w-5 h-5" />
                  Update Google Slides
                </button>
              </div>
            </div>

            {/* Usage Instructions */}
            <div className="bg-gray-800/60 backdrop-blur-sm border border-amber-700/30 rounded-xl shadow-2xl shadow-amber-900/20 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">📋 Usage Instructions</h3>
              <div className="space-y-3 text-gray-300">
                <p className="flex items-start gap-2">
                  <span className="text-amber-400 font-semibold">1.</span>
                  Fill in the week information and offering details
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-amber-400 font-semibold">2.</span>
                  Add songs using the "Add Song\" button
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-amber-400 font-semibold">3.</span>
                  Enter both main lyrics and English transcripts for each song
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-amber-400 font-semibold">4.</span>
                  Preview your JSON structure before downloading
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-amber-400 font-semibold">5.</span>
                  Download the JSON file for Google Slides automation
                </p>
                <p className="flex items-start gap-2 mt-4 p-3 bg-amber-900/20 border border-amber-700/30 rounded-lg">
                  <span className="text-amber-400 font-semibold">💡</span>
                  <span className="text-amber-200">For offerings, just enter the name (e.g., "John") - " & Family" will be added automatically in the JSON output.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
