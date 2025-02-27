import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const archive = mutation({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be logged in");
    }
    const userId = identity.subject;
    const exisitingDocument = await ctx.db.get(args.id);
    if (!exisitingDocument) {
      throw new Error("Not found");
    }
    if (exisitingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const recursiveArchive = async (document: Id<"documents">) => {
      const children = await ctx.db
        .query("documents")
        .withIndex("by_user_parent", (q) =>
          q.eq("userId", userId).eq("parentDocument", document),
        )
        .collect();

      for (const child of children) {
        await ctx.db.patch(child._id, {
          isArchived: true,
        });
        await recursiveArchive(child._id);
      }
    };

    const document = await ctx.db.patch(args.id, {
      isArchived: true,
    });

    recursiveArchive(args.id);

    return document;
  },
});
export const getSidebar = query({
  args: {
    parentDocument: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be logged in");
    }
    const userId = identity.subject;
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user_parent", (q) =>
        q.eq("userId", userId).eq("parentDocument", args.parentDocument),
      )
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();
    return documents;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    parentDocument: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be logged in");
    }
    const userId = identity.subject;
    const document = await ctx.db.insert("documents", {
      title: args.title,
      parentDocument: args.parentDocument,
      userId,
      isArchived: false,
      isPublished: false,
      content: "", // Initialize content field with empty string
    });
    return document;
  },
});

export const getTrash = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be logged in");
    }
    const userId = identity.subject;
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user_parent", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), true))
      .order("desc")
      .collect();
    return documents;
  },
});

export const restore = mutation({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be logged in");
    }
    const userId = identity.subject;
    const exisitingDocument = await ctx.db.get(args.id);
    if (!exisitingDocument) {
      throw new Error("Not found");
    }
    if (exisitingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const recursiveRestore = async (documentId: Id<"documents">) => {
      const children = await ctx.db
        .query("documents")
        .withIndex("by_user_parent", (q) =>(
          q.eq("userId", userId).eq("parentDocument", documentId))
        ).collect();
        for(const child of children) {
            await ctx.db.patch(child._id, {
                isArchived: false,
            });
            await recursiveRestore(child._id);
        }
    };
    const options: Partial<Doc<"documents">> = {
      isArchived: false,
    };
    if (exisitingDocument.parentDocument) {
      const parent = await ctx.db.get(exisitingDocument.parentDocument);
      if (parent?.isArchived) {
        options.parentDocument = undefined;
      }
    }
    const document = await ctx.db.patch(args.id, options);
    recursiveRestore(args.id);
    return document;
  },
});

export const remove = mutation({
    args: {
        id: v.id("documents"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be logged in");
    }
    const userId = identity.subject;
    const exisitingDocument = await ctx.db.get(args.id);
    if (!exisitingDocument) {
      throw new Error("Not found");
    }
    if (exisitingDocument.userId!== userId) {
      throw new Error("Unauthorized");
    }
    const document = await ctx.db.delete(args.id);
    return document;
    }
})

export const getSearch = query({
  handler:async (ctx)=>{
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be logged in");
    }
    const userId = identity.subject;
    const documents = await ctx.db
     .query("documents")
     .withIndex("by_user", (q) => q.eq("userId", userId))
     .filter((q) => q.eq(q.field("isArchived"), false))
     .order("desc")
     .collect();
    return documents;
  }
});

export const getById = query({
  args:{documentId: v.id("documents")},
  handler:async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const document = await ctx.db.get(args.documentId);
    if(!document) {
      throw new Error("Not found");
    }
    if(document.isPublished && !document.isArchived) {
      return document;
    }
    if(!identity) {
      throw new Error("You must be logged in");
    }
    const userId = identity.subject;  
    if(document.userId!==userId) {
      throw new Error("Unauthorized");
    }
    return document;
  }
});

export const update = mutation({
  args:{
    id: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async(ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if(!identity) {
      throw new Error("You must be logged in");
    }
    const userId = identity.subject;
    
    // Get existing document
    const existingDocument = await ctx.db.get(args.id);
    if(!existingDocument) {
      throw new Error("Not found");
    }
    if(existingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }
    
    // Create update object
    const updates: any = {};
    
    // Only include fields that are provided
    if (args.title !== undefined) updates.title = args.title;
    
    // Validate content is valid JSON before saving
    if (args.content !== undefined) {
      try {
        // Check if it can be parsed as JSON (validation step)
        JSON.parse(args.content);
        
        // Log content update
        console.log(`Updating document ${args.id} with content (length: ${args.content.length})`);
        
        updates.content = args.content;
      } catch (e) {
        console.error("Invalid JSON content:", e);
        throw new Error("Content must be valid JSON");
      }
    }
    
    if (args.coverImage !== undefined) updates.coverImage = args.coverImage;
    if (args.icon !== undefined) updates.icon = args.icon;
    if (args.isPublished !== undefined) updates.isPublished = args.isPublished;
    
    // Only perform update if there are fields to update
    if (Object.keys(updates).length === 0) {
      return existingDocument;
    }
    
    // Apply the updates
    const document = await ctx.db.patch(args.id, updates);
    
    return document;
  },
})

export const removeIcon = mutation({
  args:{id:v.id("documents")},
  handler:async(ctx, args)=> {
    const identity = await ctx.auth.getUserIdentity();
    if(!identity) {
      throw new Error("You must be logged in");
    }
    const userId = identity.subject;
    const exisitingDocument = await ctx.db.get(args.id);
    if(!exisitingDocument) {
      throw new Error("Not found");
    }
    if(exisitingDocument.userId!==userId) {
      throw new Error("Unauthorized");
    }
    const document = await ctx.db.patch(args.id, {
      icon: undefined,
    });
    return document;
  }
})

export const removeCoverImage = mutation({
  args:{id:v.id("documents")},
  handler:async(ctx, args)=> {
    const identity = await ctx.auth.getUserIdentity();
    if(!identity) {
      throw new Error("You must be logged in");
    }
    const userId = identity.subject;
    const exisitingDocument = await ctx.db.get(args.id);
    if(!exisitingDocument) {
      throw new Error("Not found");
    }
    if(exisitingDocument.userId!==userId) {
      throw new Error("Unauthorized");
    }
    const document = await ctx.db.patch(args.id, {
      coverImage: undefined,
    });
    return document;
  }
})