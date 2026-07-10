jest.mock("../../src/models/Node", () => ({
  find: jest.fn(),
}));

const Node = require("../../src/models/Node");
const getNodesService = require("../../src/services/node/get-nodes.service");

const chainWithNodes = (nodes) => ({
  sort: jest.fn().mockReturnValue({
    lean: jest.fn().mockResolvedValue(nodes),
  }),
});

describe("getNodesService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("filters active nodes by current user roles for normal navigation", async () => {
    Node.find.mockReturnValue(chainWithNodes([]));

    await getNodesService({ roles: ["ADMIN"] }, {});

    expect(Node.find).toHaveBeenCalledWith({
      isDeleted: false,
      isActive: true,
      roles: {
        $in: ["ADMIN"],
      },
    });
  });

  test("allows Super Admin management reads to include inactive role-restricted nodes", async () => {
    Node.find.mockReturnValue(chainWithNodes([]));

    await getNodesService(
      {
        roles: ["SUPER_ADMIN"],
      },
      {
        management: "true",
      },
    );

    expect(Node.find).toHaveBeenCalledWith({
      isDeleted: false,
    });
  });

  test("returns parent nodes with children grouped under them", async () => {
    const parent = {
      _id: {
        toString: () => "parent-id",
      },
      name: "Patients",
      parent: null,
    };
    const child = {
      _id: {
        toString: () => "child-id",
      },
      name: "Create Patient",
      parent: {
        toString: () => "parent-id",
      },
    };

    Node.find.mockReturnValue(chainWithNodes([parent, child]));

    const result = await getNodesService({ roles: ["ADMIN"] }, {});

    expect(result).toEqual([
      {
        ...parent,
        children: [child],
      },
    ]);
  });
});
