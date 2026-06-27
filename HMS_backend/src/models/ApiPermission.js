const mongoose = require("mongoose");

const apiPermissionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    allowedRoles: {
      type: [String],
      required: true,
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

apiPermissionSchema.index({
  key: 1,
  isActive: 1,
});

module.exports = mongoose.model("ApiPermission", apiPermissionSchema);
