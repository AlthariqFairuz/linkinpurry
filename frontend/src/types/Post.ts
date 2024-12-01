export interface Post {
    id: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    content: string;
    user: {
        fullName: string;
        profilePhotoPath: string;
    }
}

