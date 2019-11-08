import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Post } from './post.model';
import { Subject, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';


@Injectable({providedIn: 'root'})
export class PostsService {
    private posts: Post[] = [];
    private postsUpdated = new Subject<Post[]>();

    constructor(private http: HttpClient, private router: Router) {}

    getPosts() {
        this.http.get<{message: string, posts: any}>('http://localhost:3000/api/posts')
            .pipe(map(data => {
                return data.posts.map(post => {
                    return {
                        id: post._id,
                        title: post.title,
                        content: post.content,
                        imagePath: post.imagePath
                    };
                });
            }))
            .subscribe(mappedPosts => {
                this.posts = mappedPosts;
                this.postsUpdated.next([...this.posts]);
            });
    }

    getPostUpdateListener() {
        return this.postsUpdated.asObservable();
    }

    getPost(id: string) {
        return this.http.get<{_id: string, title: string, content: string, imagePath: string}>('http://localhost:3000/api/posts/' + id);
    }

    addPost(title: string, content: string, image: File) {
        const postData = new FormData();
        postData.append('title', title);
        postData.append('content', content);
        postData.append('image', image, title);
        this.http.post<{message: string, post: Post}>('http://localhost:3000/api/posts', postData)
            .subscribe(res => {
                console.log('res', res);
                const post: Post = {id: res.post.id, title, content, imagePath: res.post.imagePath};
                this.posts.push(post);
                console.log(post);
                this.postsUpdated.next([...this.posts]);
                this.router.navigate(['/']);
            });
    }

    updatePost(id: string, title: string, content: string, image: File | string) {
        // const post: Post = { id, title, content, imagePath: image };
        let postData: Post | FormData;
        if (typeof image === 'string') {
            postData = {id, title, content, imagePath: image};
        } else {
            postData = new FormData();
            postData.append('id', id);
            postData.append('title', title);
            postData.append('content', content);
            postData.append('image', image, title);
        }

        this.http.put('http://localhost:3000/api/posts/' + id, postData)
            .subscribe(res => {
                const updatedPosts = [...this.posts];
                const oldPostIndex = updatedPosts.findIndex(p => p.id === id);
                const post: Post = 
                updatedPosts[oldPostIndex] = {id, title, content, imagePath: ' '};
                this.posts = updatedPosts;
                this.postsUpdated.next([...this.posts]);
                this.router.navigate(['/']);
            });
    }

    deletePost(id: string) {
        this.http.delete('http://localhost:3000/api/posts/' + id)
            .subscribe(() => {
                const updatedPosts = this.posts.filter(post => post.id !== id);
                this.posts = updatedPosts;
                this.postsUpdated.next([...this.posts]);
            });
    }
}

