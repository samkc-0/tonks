import { useEffect, useState, useRef } from "react";
import axios from "axios";

function openInNewTabToDownload(url: string) {
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.download = ""; // Suggest download if allowed
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

interface Person {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  birthday: string;
  nickname: string;
  backstory: string;
  address: {
    street: string;
    city: string;
    zip_code: string;
    country: string;
  };
  linkedin_photo_url: string;
  facebook_photo_url: string;
  avatar_url: string;
  password: string;
  real_email_success?: boolean;
  token?: string;
}

export default function App() {
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const fetchPerson = async () => {
    try {
      setIsLoading(true);
      const res = await axios.post("/create");
      const newPerson = res.data;
      setPeople((prev) => {
        const updated = [...prev, newPerson];
        localStorage.setItem("synthetic-identities", JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error("Error fetching person:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deletePerson = (indexToDelete: number) => {
    setPeople((prev) => {
      const updated = prev.filter((_, i) => i !== indexToDelete);
      localStorage.setItem("synthetic-identities", JSON.stringify(updated));
      return updated;
    });
  };

  const exportIdentities = () => {
    const blob = new Blob([JSON.stringify(people, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    openInNewTabToDownload(url);
  };

  useEffect(() => {
    const storedPeople = localStorage.getItem("synthetic-identities");
    if (storedPeople) {
      setPeople(JSON.parse(storedPeople));
    } else {
      fetchPerson(); // initial load if none stored
    }
  }, []);

  // Handle click outside to close drawer
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        setSelectedPerson(null);
      }
    };

    if (selectedPerson) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedPerson]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-10 px-6 antialiased">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-serif text-4xl font-extrabold mb-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent text-center tracking-tight">
          tonks
        </h1>
        <p className="text-gray-400 text-center mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent font-serif">
          synthetic identity generator
        </p>

        <div className="flex justify-center mb-8 mt-2">
          <button
            onClick={exportIdentities}
            className="flex items-center gap-2 bg-gray-700 hover:bg-blue-500 text-gray-100 hover:text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-all duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
              />
            </svg>
            Download JSON
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {people.map((person, index) => (
            <div
              key={index}
              onClick={() => setSelectedPerson(person)}
              className="relative cursor-pointer bg-gray-800 rounded-xl p-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            >
              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // prevent opening drawer
                  deletePerson(index);
                }}
                className="absolute top-2 right-2 text-gray-500 hover:text-red-400 transition text-xs bg-gray-700 rounded px-2 py-1"
                title="Delete"
              >
                ✕
              </button>
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={person.linkedin_photo_url}
                  alt={`${person.first_name} ${person.last_name}`}
                  className="w-16 h-16 rounded-full object-cover shadow-sm"
                />
                <div className="flex flex-col">
                  <span className="text-xl font-semibold text-white tracking-tight">
                    {person.first_name} {person.last_name}
                  </span>
                  <span className="text-sm text-gray-400">
                    @{person.username}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <InfoItem label="Email" value={person.email} />
                <InfoItem
                  label="Password"
                  value={person.password}
                  type="password"
                />
                <InfoItem label="Birthday" value={person.birthday} />
                <InfoItem label="Nickname" value={person.nickname} />
                <InfoItem
                  label="Address"
                  value={`${person.address.street}, ${person.address.city}, ${person.address.zip_code}, ${person.address.country}`}
                />
              </div>
            </div>
          ))}

          <button
            onClick={fetchPerson}
            disabled={isLoading}
            className="group relative h-64 bg-gray-800 rounded-xl flex flex-col items-center justify-center shadow-md transition-all duration-300 hover:bg-gray-850 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-8 h-8 border-3 border-blue-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="text-5xl font-light text-gray-500 group-hover:text-blue-400 transition-colors duration-200">
                  +
                </span>
                <span className="mt-3 text-sm font-medium text-gray-400 group-hover:text-blue-400 transition-colors duration-200">
                  Create New Identity
                </span>
              </>
            )}
          </button>
        </div>
      </div>
      {/* Drawer — slides in from the right, dashboard stays visible */}
      {selectedPerson && (
        <div className="fixed inset-0 pointer-events-none z-40 backdrop-blur-sm" />
      )}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full z-50 transition-transform duration-300 ease-in-out ${
          selectedPerson ? "translate-x-0" : "translate-x-full"
        } w-full max-w-md bg-gray-900 shadow-lg border-l border-gray-800 overflow-y-auto`}
      >
        {selectedPerson && (
          <div className="p-6">
            <button
              onClick={() => setSelectedPerson(null)}
              className="text-gray-400 hover:text-white text-sm mb-4"
            >
              Close
            </button>

            <div className="flex items-center justify-center gap-6 mb-6">
              <img
                src={selectedPerson.linkedin_photo_url}
                alt="LinkedIn"
                className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-600 shadow-sm cursor-pointer hover:opacity-80 transition"
                title="Click to download LinkedIn photo"
                onClick={() =>
                  openInNewTabToDownload(selectedPerson.linkedin_photo_url)
                }
              />
              <img
                src={selectedPerson.facebook_photo_url}
                alt="Facebook"
                className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-400 shadow-sm cursor-pointer hover:opacity-80 transition"
                title="Click to download Facebook photo"
                onClick={() =>
                  openInNewTabToDownload(selectedPerson.facebook_photo_url)
                }
              />
              <img
                src={selectedPerson.avatar_url}
                alt="Avatar"
                className="w-16 h-16 rounded-full bg-white p-1 shadow-sm cursor-pointer hover:opacity-80 transition"
                title="Click to download avatar"
                onClick={() =>
                  openInNewTabToDownload(selectedPerson.avatar_url)
                }
              />
            </div>

            {/* Name and Username */}
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-white">
                {selectedPerson.first_name} {selectedPerson.last_name}
              </h2>
              <p className="text-gray-400">@{selectedPerson.username}</p>
            </div>

            <div className="flex flex-col gap-4">
              <InfoItem label="Email" value={selectedPerson.email} />
              {selectedPerson?.email?.includes("@example.com") && (
                <button
                  onClick={async () => {
                    console.log("click");
                    try {
                      setIsUpgrading(true);
                      const res = await axios.post(
                        "/upgrade-email",
                        selectedPerson
                      );
                      const updatedPerson = { ...selectedPerson, ...res.data };
                      console.log(updatedPerson);
                      setSelectedPerson(updatedPerson);
                      console.log(res.data);
                      // Update localStorage + state
                      setPeople((prev) => {
                        const updated = prev.map((p) =>
                          p.username === updatedPerson.username
                            ? updatedPerson
                            : p
                        );
                        localStorage.setItem(
                          "synthetic-identities",
                          JSON.stringify(updated)
                        );
                        return updated;
                      });
                    } catch (err) {
                      console.error("Upgrade failed:", err);
                    } finally {
                      setIsUpgrading(false);
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded text-sm disabled:opacity-60"
                  disabled={isUpgrading}
                >
                  {isUpgrading ? "Activating..." : "Activate Real Email"}
                </button>
              )}

              <InfoItem
                label="Password"
                value={selectedPerson.password}
                type="password"
              />

              <InfoItem label="Birthday" value={selectedPerson.birthday} />
              <InfoItem label="Nickname" value={selectedPerson.nickname} />
              <InfoItem label="Backstory" value={selectedPerson.backstory} />
              <InfoItem label="Street" value={selectedPerson.address.street} />
              <InfoItem label="City" value={selectedPerson.address.city} />
              <InfoItem
                label="Zip Code"
                value={selectedPerson.address.zip_code}
              />
              <InfoItem
                label="Country"
                value={selectedPerson.address.country}
              />
              <InfoItem
                label="LinkedIn Photo URL"
                value={selectedPerson.linkedin_photo_url}
              />
              <InfoItem
                label="Facebook Photo URL"
                value={selectedPerson.facebook_photo_url}
              />
              <InfoItem label="Avatar URL" value={selectedPerson.avatar_url} />
            </div>
            {/* 💌 Bottom half: inbox */}
            {selectedPerson?.token && (
              <MailInbox token={selectedPerson.token} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface InfoItemProps {
  label: string;
  value: string;
  type?: "text" | "password";
}

function InfoItem({ label, value, type = "text" }: InfoItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
        {label}
      </span>
      <div className="mt-1.5 flex items-center gap-2">
        {type === "password" ? (
          <>
            <span
              className="text-sm text-gray-200 font-mono truncate max-w-[200px] cursor-pointer"
              title="Click to copy"
              onClick={handleCopy}
            >
              {isVisible ? value : "••••••••"}
            </span>
            <button
              onClick={() => setIsVisible(!isVisible)}
              className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded px-1"
            >
              {isVisible ? "Hide" : "Show"}
            </button>
          </>
        ) : (
          <span
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            title="Click to copy"
            className="text-sm text-gray-200 truncate max-w-[240px] cursor-pointer hover:text-blue-400 transition"
          >
            {value}
          </span>
        )}
        {copied && (
          <span className="text-xs text-green-400 font-medium transition-opacity duration-200">
            Copied!
          </span>
        )}
      </div>
    </div>
  );
}

interface MailtmMessage {
  id: string;
  from: { address: string };
  subject: string;
  intro: string;
  seen: boolean;
  createdAt: string;
}

export function MailInbox({ token }: { token: string }) {
  const [messages, setMessages] = useState<MailtmMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  const fetchMessage = async (id: string) => {
    try {
      const res = await axios.get("/message", {
        params: { id, token },
      });
      setSelectedMessage(res.data);
    } catch (err) {
      console.error("Failed to fetch full message", err);
      setSelectedMessage(null);
    }
  };

  const fetchInbox = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/inbox", {
        params: { token },
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = Array.isArray(res.data) ? res.data : [];
      console.log(data);
      setMessages(data);
    } catch (err) {
      console.error("Mail.tm inbox fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, [token]);

  return (
    <div className="mt-6 border-t border-gray-700 pt-4 h-48 overflow-y-auto pr-1">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-white">Inbox</h3>
        <button
          onClick={fetchInbox}
          disabled={loading}
          className="text-sm text-blue-400 hover:text-blue-300 transition disabled:opacity-50"
        >
          Refresh
        </button>
      </div>
      {loading ? (
        <p className="text-sm text-gray-400">Loading messages...</p>
      ) : messages.length === 0 ? (
        <p className="text-sm text-gray-500">No messages yet.</p>
      ) : (
        <>
          <ul className="space-y-2">
            {messages.map((msg) => (
              <li
                key={msg.id}
                onClick={() => {
                  setSelectedId(msg.id);
                  fetchMessage(msg.id);
                }}
                className={`cursor-pointer bg-gray-800 p-3 rounded-md shadow hover:bg-gray-700 transition ${
                  msg.id === selectedId ? "ring-2 ring-blue-500" : ""
                }`}
              >
                <div className="text-sm text-gray-300 font-medium">
                  {msg.subject || "(no subject)"}
                </div>
                <div className="text-xs text-gray-400">
                  From: {msg.from?.address}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(msg.createdAt).toLocaleString()}
                </div>
                <div className="text-xs text-gray-400 mt-1 italic">
                  {msg.intro}
                </div>
              </li>
            ))}
          </ul>
          {selectedMessage && (
            <div className="mt-4 border-t border-gray-700 pt-3 text-sm text-gray-300">
              <h4 className="text-base font-semibold text-white mb-1">
                {selectedMessage.subject}
              </h4>
              <p className="text-xs text-gray-400 mb-2">
                From: {selectedMessage.from?.address} <br />
                Date: {new Date(selectedMessage.createdAt).toLocaleString()}
              </p>
              <div className="whitespace-pre-wrap">
                {selectedMessage.text || selectedMessage.html || "(No content)"}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
