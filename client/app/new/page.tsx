// Page for new Project

import React from 'react';
import axios, { AxiosResponse } from 'axios';
import { GetTokenParams } from 'next-auth/jwt';

import { db } from '@/lib/db';
import Wrapper from '@/components/wrapper';
import Navbar from '@/components/Navbar';

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface GithubRepository {
  id: string;
  name: string;
  clone_url: string;
}

const GITHUB_API_BASE_URL = 'https://api.github.com';

async function get_repositories(
  github_access_token: string | undefined
): Promise<Array<GithubRepository> | undefined> {
  const user = await db.user.findUnique({
    where: {
      username: 'test',
    },
    select: {
      github_access_token: true,
      github_installation_id: true,
    },
  });
  const installation_id = user?.github_installation_id;
  const access_token = user?.github_access_token;

  const requestOptions = {
    headers: {
      Authorization: `token ${access_token}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'Your-App',
      'X-GitHub-Installation-Id': installation_id,
    },
  };

  const uri = `${GITHUB_API_BASE_URL}/user/repos`;

  try {
    const response: AxiosResponse = await axios.get(uri, requestOptions);
    return response.data;
  } catch (err) {
    return undefined;
  }
}

export default async function Page() {
  // const user = getCurrentUser();
  const github_access_token = process.env.GITHUB_ACCESS_TOKEN;

  const data = await get_repositories(github_access_token);

  return (
    <div className="bg-[#1b222f] overflow-hidden">
      <Navbar />
      <Wrapper>


        {/* <div>Import Github Repository</div> */}
        <div className='m-5' >
          <Card className="w-5/6 bg-[#1b222f] text-white">
            <CardHeader>
              <CardTitle>Import Github Repository</CardTitle>
              <CardDescription>Import your repositories to start using docify</CardDescription>
            </CardHeader>
            <CardContent>

              <form >
                <div className="grid w-1/2 items-center gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Github Username</Label>
                    <Input className='bg-[#1b222f]' type="email" id="email" placeholder={username} />
                  </div>
                </div>
              </form>

              <div>
                { data && data.length>0
                 ?
                  data.map((repo: { name: string, clone_url: string, id:string }, index: number) => (
                  <div
                    key={id}
                    className="m-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
                  >
                    <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                    <div className='flex flex-row items-center'>
                      <div className="space-y-2 w-3/4">
                        <p className="text-m font-medium leading-none">
                          {repo.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {repo.clone_url}
                        </p>


                      </div>
                      <div className=''>
                        <Button variant="outline" className=' bg-[#1b222f] text-white'>Import</Button>
                      </div>
                    </div>
                  </div>
                ))
                : null}
              </div>

            </CardContent>
          </Card>
        </div>


      </Wrapper>
    </div>
  );
}