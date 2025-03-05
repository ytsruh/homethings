// Helper function to generate a random date within the last 30 days
function getRandomDate() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  ).toISOString();
}

// Sample document types and their size ranges (in MB)
const documentTypes = [
  { ext: "pdf", maxSize: 5 },
  { ext: "doc", maxSize: 3 },
  { ext: "jpg", maxSize: 2 },
  { ext: "png", maxSize: 1.5 },
  { ext: "xlsx", maxSize: 4 },
];

// Helper function to generate random documents
function generateRandomDocuments() {
  if (Math.random() < 0.3) return []; // 30% chance of no documents

  const numDocs = Math.floor(Math.random() * 3) + 1; // 1-3 documents
  return Array.from({ length: numDocs }, (_, index) => {
    const docType =
      documentTypes[Math.floor(Math.random() * documentTypes.length)];
    const size = (Math.random() * docType.maxSize).toFixed(1);
    return {
      id: (index + 1).toString(),
      name: `document-${index + 1}.${docType.ext}`,
      size: `${size}MB`,
    };
  });
}

// Helper function to generate random updates
function generateRandomUpdates() {
  if (Math.random() < 0.2) return []; // 20% chance of no updates

  const numUpdates = Math.floor(Math.random() * 4) + 1;

  return Array.from({ length: numUpdates }, (_, index) => ({
    id: (index + 1).toString(),
    text: [
      "Updated task status",
      "Added new requirements",
      "Fixed a minor issue",
      "Made progress on implementation",
      "Reviewed and added comments",
      "Updated documentation",
      "Started working on this task",
    ][Math.floor(Math.random() * 7)],
    timestamp: getRandomDate(),
  })).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

const tasks = [
  {
    id: "TASK-8782",
    title:
      "You can't compress the program without quantifying the open-source SSD pixel!",
    status: "in progress",
    labels: ["documentation"],
    priority: "medium",
    documents: generateRandomDocuments(),
    updates: generateRandomUpdates(),
    completed: false,
  },
  {
    id: "TASK-7878",
    title:
      "Try to calculate the EXE feed, maybe it will index the multi-byte pixel!",
    status: "todo",
    labels: ["documentation", "feature"],
    priority: "medium",
    documents: generateRandomDocuments(),
    updates: generateRandomUpdates(),
    completed: false,
  },
  {
    id: "TASK-7839",
    title: "We need to bypass the neural TCP card!",
    status: "todo",
    labels: ["bug"],
    priority: "high",
    documents: generateRandomDocuments(),
    updates: generateRandomUpdates(),
    completed: false,
  },
  {
    id: "TASK-5562",
    title:
      "The SAS interface is down, bypass the open-source pixel so we can back up the PNG bandwidth!",
    status: "todo",
    labels: ["feature"],
    priority: "medium",
    documents: generateRandomDocuments(),
    updates: generateRandomUpdates(),
    completed: false,
  },
  {
    id: "TASK-8686",
    title:
      "I'll parse the wireless SSL protocol, that should driver the API panel!",
    status: "canceled",
    labels: ["feature"],
    priority: "medium",
    documents: generateRandomDocuments(),
    updates: generateRandomUpdates(),
    completed: false,
  },
  {
    id: "TASK-1280",
    title:
      "Use the digital TLS panel, then you can transmit the haptic system!",
    status: "done",
    labels: ["bug"],
    priority: "high",
    documents: generateRandomDocuments(),
    updates: generateRandomUpdates(),
    completed: false,
  },
  {
    id: "TASK-7262",
    title:
      "The UTF8 application is down, parse the neural bandwidth so we can back up the PNG firewall!",
    status: "done",
    labels: ["feature"],
    priority: "high",
    documents: generateRandomDocuments(),
    updates: generateRandomUpdates(),
    completed: false,
  },
  {
    id: "TASK-1138",
    title:
      "Generating the driver won't do anything, we need to quantify the 1080p SMTP bandwidth!",
    status: "in progress",
    labels: ["feature"],
    priority: "medium",
    documents: generateRandomDocuments(),
    updates: generateRandomUpdates(),
    completed: false,
  },
  {
    id: "TASK-7184",
    title: "We need to program the back-end THX pixel!",
    status: "todo",
    labels: ["feature"],
    priority: "low",
    documents: generateRandomDocuments(),
    updates: generateRandomUpdates(),
    completed: false,
  },
  {
    id: "TASK-5160",
    title:
      "Calculating the bus won't do anything, we need to navigate the back-end JSON protocol!",
    status: "in progress",
    labels: ["documentation"],
    priority: "high",
    documents: generateRandomDocuments(),
    updates: generateRandomUpdates(),
    completed: false,
  },
  {
    id: "TASK-5618",
    title:
      "Generating the driver won't do anything, we need to index the online SSL application!",
    status: "done",
    labels: ["documentation"],
    priority: "medium",
    documents: generateRandomDocuments(),
    updates: generateRandomUpdates(),
    completed: false,
  },
  {
    id: "TASK-6699",
    title:
      "I'll transmit the wireless JBOD capacitor, that should hard drive the SSD feed!",
    status: "todo",
    labels: ["documentation"],
    priority: "medium",
    documents: generateRandomDocuments(),
    updates: generateRandomUpdates(),
    completed: false,
  },
];

export const data = tasks.map((task) => ({
  ...task,
  documents: generateRandomDocuments(),
  updates: generateRandomUpdates(),
  completed: false,
}));
