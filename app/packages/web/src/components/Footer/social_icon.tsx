import React from 'react';
import DiscordIcon from '../svgs/discord';
import TwitterIcon from '../svgs/twitter';
import InstagramIcon from '../svgs/instagram';
import RedditIcon from '../svgs/reddit';
import YoutubeIcon from '../svgs/youtube';
import TiktokIcon from '../svgs/titkok';
import LinkedinIcon from '../svgs/linkedin';

export const SocialIcon = () => {
  return (
    <div
      className="d-flex justify-content-between"
      style={{ width: '200px', margin: 'auto' }}
    >
      <a href="https://twitter.com/Queendomverse">
        <TwitterIcon />
      </a>
      <a href="https://discord.gg/vYBcfGSdYr">
        <DiscordIcon />
      </a>
      <a href="https://instagram.com">
        <InstagramIcon />
      </a>
      {/* <a href="https://www.reddit.com/r/queendomverse">
        <RedditIcon />
      </a> */}
      <a href="https://www.tiktok.com/">
        <TiktokIcon />
      </a>
      <a href="https://www.youtube.com">
        <YoutubeIcon />
      </a>
      <a href="https://www.linkedin.com/company/queendomverse/">
        <LinkedinIcon />
      </a>
    </div>
  );
};
