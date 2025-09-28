import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { User, Github, Linkedin, Instagram, Twitter, MessageSquare, BarChart2, Crown, BookOpen, Users, Share2, GraduationCap } from 'lucide-react';
import api from '../api';

const MemberCard = ({ member, syncSpaceId, currentUserRole, syncSpace }) => {
  const [showStats, setShowStats] = useState(false);

  // Handle merged member structure from SyncSpace
  const user = member;
  const role = member.role || 'participant';
  const contributions = member.contributions || {};
  const socialLinks = member.socialLinks || {};
  const lastActive = member.lastActive;
  const learningGoals = member.learningGoals;
  const studyPreferences = member.studyPreferences;

  // Calculate contribution metrics - prioritize database contributions over calculated stats
  const completedTasks = contributions.tasksCompleted || member.completedTasks || 0;
  const notesShared = contributions.notesShared || 0;
  const messagesSent = contributions.messagesSent || 0;
  const totalContributions = completedTasks + notesShared + messagesSent;


  // Role icons and colors
  const getRoleInfo = (role) => {
    switch (role) {
      case 'facilitator':
        return { icon: Crown, color: 'text-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', label: 'Facilitator', shortLabel: 'Lead' };
      case 'note-taker':
        return { icon: BookOpen, color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/30', label: 'Note Taker', shortLabel: 'Notes' };
      case 'peer-mentor':
        return { icon: GraduationCap, color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/30', label: 'Peer Mentor', shortLabel: 'Mentor' };
      case 'resource-sharer':
        return { icon: Share2, color: 'text-purple-500', bgColor: 'bg-purple-100 dark:bg-purple-900/30', label: 'Resource Sharer', shortLabel: 'Share' };
      default:
        return { icon: Users, color: 'text-gray-500', bgColor: 'bg-gray-100 dark:bg-gray-900/30', label: 'Participant', shortLabel: 'Member' };
    }
  };

  const roleInfo = getRoleInfo(role);
  const RoleIcon = roleInfo.icon;
  
  // Format social links to ensure they have proper URLs
  const formatSocialLink = (link, type) => {
    if (!link) return null;
    
    // If link already has http/https, return as is
    if (link.startsWith('http://') || link.startsWith('https://')) {
      return link;
    }
    
    // Add appropriate prefix based on social media type
    switch (type) {
      case 'github':
        return `https://github.com/${link}`;
      case 'linkedin':
        return `https://linkedin.com/in/${link}`;
      case 'instagram':
        return `https://instagram.com/${link}`;
      case 'twitter':
        return `https://twitter.com/${link}`;
      default:
        return `https://${link}`;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center mb-3">
        {
          user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={user.username}
              className="w-12 h-12 rounded-full mr-3 object-cover border-2 border-gray-200 dark:border-gray-600"
            />
          ) : (
            <div className="w-12 h-12 rounded-full mr-3 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
              <User size={24} />
            </div>
          )
        }
        <div className="flex-1 min-w-0">
          <div className="flex flex-col">
            <h3 className="font-bold text-gray-900 dark:text-white truncate">{user.username}</h3>
            <div className="flex items-center justify-between mt-0.5">
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex-1 min-w-0">{user.bio || user.email || ''}</p>
              <div className={`flex items-center px-1 py-0.5 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${roleInfo.bgColor} ${roleInfo.color} whitespace-nowrap`}>
                <RoleIcon size={10} className="mr-0.5 flex-shrink-0" />
                <span className="text-xs leading-none">
                  {roleInfo.shortLabel === 'Member' ? 'Mem' :
                   roleInfo.shortLabel === 'Mentor' ? 'Men' :
                   roleInfo.shortLabel === 'Notes' ? 'Not' :
                   roleInfo.shortLabel === 'Share' ? 'Sha' :
                   roleInfo.shortLabel === 'Lead' ? 'Lea' : roleInfo.shortLabel}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Social Links */}
      <div className="flex justify-center space-x-3 mb-3">
        {socialLinks?.github && (
          <a
            href={formatSocialLink(socialLinks.github, 'github')}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            title="GitHub"
          >
            <Github size={18} />
          </a>
        )}
        {socialLinks?.linkedin && (
          <a
            href={formatSocialLink(socialLinks.linkedin, 'linkedin')}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
            title="LinkedIn"
          >
            <Linkedin size={18} />
          </a>
        )}
        {socialLinks?.instagram && (
          <a
            href={formatSocialLink(socialLinks.instagram, 'instagram')}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
            title="Instagram"
          >
            <Instagram size={18} />
          </a>
        )}
        {socialLinks?.twitter && (
          <a
            href={formatSocialLink(socialLinks.twitter, 'twitter')}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 dark:text-gray-400 hover:text-blue-400 transition-colors"
            title="Twitter"
          >
            <Twitter size={18} />
          </a>
        )}
        {socialLinks?.whatsapp && (
          <a
            href={`https://wa.me/${socialLinks.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 dark:text-gray-400 hover:text-green-500 transition-colors"
            title="WhatsApp"
          >
            <MessageSquare size={18} />
          </a>
        )}
      </div>


      {/* Task Stats Toggle */}
      <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
        <button
          onClick={() => setShowStats(!showStats)}
          className="w-full flex items-center justify-between text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
        >
          <span className="font-medium">Task Statistics</span>
          <BarChart2 size={16} className={`transform transition-transform ${showStats ? 'rotate-180' : ''}`} />
        </button>

        <div className={`overflow-hidden transition-all duration-300 ${showStats ? 'max-h-60 mt-2' : 'max-h-0'}`}>
          <div className="space-y-3">
            {/* Total Contributions */}
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">{totalContributions}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total Contributions</div>
            </div>

            {/* Contribution Breakdown */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="font-medium text-gray-900 dark:text-white">{completedTasks}</div>
                <div className="text-gray-500 dark:text-gray-400">Tasks Done</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-900 dark:text-white">{notesShared}</div>
                <div className="text-gray-500 dark:text-gray-400">Notes Shared</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-900 dark:text-white">{messagesSent}</div>
                <div className="text-gray-500 dark:text-gray-400">Messages</div>
              </div>
            </div>


            {/* Last Active */}
            {member.lastActive && (
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-1 border-t border-gray-200 dark:border-gray-600">
                Last active: {new Date(member.lastActive).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default MemberCard;