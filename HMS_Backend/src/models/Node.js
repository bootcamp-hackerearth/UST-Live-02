const mongoose = require("mongoose");

const ROLES = require("../constants/roles");

const nullableRef = (ref) => ({
  type: mongoose.Schema.Types.ObjectId,
  ref,
  default: null,
});

const softDeleteFields = () => ({
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedBy: nullableRef("User"),
  deletedAt: {
    type: Date,
    default: null,
  },
});

const auditFields = () => ({
  createdBy: nullableRef("User"),
  updatedBy: nullableRef("User"),
  ...softDeleteFields(),
});

const nodeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    path: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      default: 0,
    },
    roles: {
      type: [String],
      enum: Object.values(ROLES),
      default: [],
    },
    apiPermissions: [
      {
        method: {
          type: String,
          enum: ["GET", "POST", "PUT", "PATCH", "DELETE", "ALL"],
          required: true,
          uppercase: true,
          trim: true,
        },
        path: {
          type: String,
          required: true,
          trim: true,
        },
        roles: {
          type: [String],
          enum: Object.values(ROLES),
          default: [],
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    parent: {
      ...nullableRef("Node"),
    },
    ...auditFields(),
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

nodeSchema.index({
  path: 1,
});

nodeSchema.index({
  roles: 1,
  isActive: 1,
  isDeleted: 1,
});
nodeSchema.index({
  "apiPermissions.method": 1,
  "apiPermissions.path": 1,
});
nodeSchema.index({
  parent: 1,
  order: 1,
});

module.exports = mongoose.model("Node", nodeSchema);
