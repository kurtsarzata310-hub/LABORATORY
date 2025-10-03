const packages = [];
// Package class
class Package {
  constructor(id, destination, weight, status) {
    this.id = id;
    this.destination = destination;
    this.weight = weight;
    this.status = status;
  }
}
// Package Tracker class
class PackageTracker {
  constructor() {
    this.packages = packages;
  }
  // Add package to tracker
  addPackage(pkg) {
    this.packages.push(pkg);
  }
  // Calculate total weight of all packages
  calculateTotalWeight() {
    return this.packages.reduce((total, pkg) => total + pkg.weight, 0);
  }
  // Filter packages by status
  filterByStatus(status) {
    return this.packages.filter(pkg => pkg.status === status);
  }
  // Find the heaviest package
  findHeaviestPackage() {
    return this.packages.reduce((heaviest, pkg) => pkg.weight > heaviest.weight ? pkg : heaviest, this.packages[0]);
  }
  // Group packages by destination
  groupByDestination() {
    const destinations = {};
    this.packages.forEach(pkg => {
      if (!destinations[pkg.destination]) {
        destinations[pkg.destination] = [];
      }
      destinations[pkg.destination].push(pkg);
    });
    return destinations;
  }
  // Simulate fetching new packages asynchronously
  async fetchNewPackages(newPackages) {
    return new Promise(resolve => {
      setTimeout(() => {
        this.packages.push(...newPackages);
        console.log("New packages fetched and updated.");
        resolve();
      }, 1000);
    });
  }
}
// Create package tracker and add packages
const packageTracker = new PackageTracker();
const packageList = [
  new Package("PKG-001", "MANILA", 10, "In Transit"),
  new Package("PKG-002", "CALBAYOG", 20, "Delivered"),
  new Package("PKG-003", "SAN JUAN", 15, "In Transit"),
  new Package("PKG-004", "SAN JOSE", 30, "Delivered"),
];
packageList.forEach(pkg => packageTracker.addPackage(pkg));
// Calculate total weight
const totalWeight = packageTracker.calculateTotalWeight();
console.log(`Total weight: ${totalWeight} kg`);
// Filter packages by status
const inTransitPackages = packageTracker.filterByStatus("In Transit");
console.log("Packages in transit:");
inTransitPackages.forEach(pkg => console.log(`ID: ${pkg.id}, Destination: ${pkg.destination}`));
// Find the heaviest package
const heaviestPackage = packageTracker.findHeaviestPackage();
console.log(`Heaviest package: ID ${heaviestPackage.id}, Weight: ${heaviestPackage.weight} kg`);
// Group packages by destination
const destinations = packageTracker.groupByDestination();
console.log("Packages by destination:");
Object.keys(destinations).forEach(destination => {
  console.log(`${destination}:`);
  destinations[destination].forEach(pkg => console.log(`- ID: ${pkg.id}, Weight: ${pkg.weight} kg`));
});
// Fetch new packages
async function main() {
  const newPackages = [
    new Package("PKG-005", "CEBU", 25, "In Transit"),
    new Package("PKG-006", "MANILA", 12, "Delivered"),
  ];
  await packageTracker.fetchNewPackages(newPackages);
  console.log("Updated package list:");
  packageTracker.packages.forEach(pkg => console.log(`ID: ${pkg.id}, Destination: ${pkg.destination}, Weight: ${pkg.weight} kg`));
}
main();